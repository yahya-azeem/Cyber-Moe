export interface ContactInfo {
  name: string;
  location: string;
  phone: string;
  email: string;
  github: string;
  githubUrl: string;
  linkedinUrl: string;
  htbUrl: string;
}

export interface TechnicalSkills {
  languages: string[];
  systems: string[];
  deepLearning: string[];
  offensiveSecurity: string[];
}

export interface Project {
  title: string;
  date: string;
  tech: string;
  url: string;
  bullets: string[];
}

export interface Achievement {
  title: string;
  date: string;
  bullets: string[];
}

export interface Experience {
  role: string;
  company: string;
  date: string;
  bullets: string[];
}

export interface OtherProject {
  title: string;
  url: string;
}

export interface Education {
  school: string;
  degree: string;
  date: string;
  location: string;
}

export interface ResumeData {
  contact: ContactInfo;
  summary: string;
  skills: TechnicalSkills;
  experience: Experience[];
  achievements: Achievement[];
  projects: Project[];
  otherProjects: OtherProject[];
  education: Education;
}

// Clean basic LaTeX markup from string
function cleanLatex(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\&/g, '&')
    .replace(/\\_/g, '_')
    .replace(/\\%/g, '%')
    .replace(/``/g, '"')
    .replace(/''/g, '"')
    .replace(/\\\*/g, '*')
    .replace(/\\noindent/g, '')
    .replace(/\\hfill/g, '')
    .replace(/\\cdot/g, '•')
    .replace(/\$\s*\\cdot\s*\$/g, '•')
    .replace(/\\color\s*\{[a-zA-Z0-9_#.-]+\}\s*/g, '')
    .replace(/\\href\s*\{([^}]+)\}\s*\{([^}]+)\}/g, '$2')
    .replace(/\\textbf\s*\{([^}]+)\}/g, '$1')
    .replace(/\\textit\s*\{([^}]+)\}/g, '$1')
    .replace(/\\vspace\s*\{[^}]+\}/g, '')
    .replace(/\\\\/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Strip LaTeX comments
function stripComments(content: string): string {
  return content
    .split('\n')
    .map(line => {
      // Find comment symbol % if it is not escaped as \%
      const idx = line.search(/(?<!\\)%/);
      if (idx !== -1) {
        return line.substring(0, idx);
      }
      return line;
    })
    .join('\n');
}

export function parseResume(texContent: string): ResumeData {
  const content = stripComments(texContent);

  // Initialize data structures
  const contact: ContactInfo = {
    name: 'Muhammad Yahya Azeem',
    location: 'Irving, Texas',
    phone: '+1 (945) 246-0159',
    email: 'yahyaazeem44@gmail.com',
    github: 'github.com/yahya-azeem',
    githubUrl: 'https://github.com/yahya-azeem',
    linkedinUrl: 'https://www.linkedin.com/in/muhammad-azeem-474612357/',
    htbUrl: 'https://profile.hackthebox.com/profile/019c6962-e472-7141-bfee-10910c4881e8',
  };

  let summary = '';
  const skills: TechnicalSkills = {
    languages: [],
    systems: [],
    deepLearning: [],
    offensiveSecurity: [],
  };
  const experience: Experience[] = [];
  const achievements: Achievement[] = [];
  const projects: Project[] = [];
  const otherProjects: OtherProject[] = [];
  const education: Education = {
    school: 'The University of Texas at Dallas',
    degree: 'Bachelor of Science in Computer Science',
    date: '2026 -- 2030',
    location: 'Richardson, Texas',
  };

  // Find sections
  const sections: { name: string; content: string }[] = [];
  const sectionRegex = /\\section\*?\{([^}]+)\}/g;
  let match;
  const indices: number[] = [];
  const sectionNames: string[] = [];

  while ((match = sectionRegex.exec(content)) !== null) {
    indices.push(match.index);
    sectionNames.push(match[1]);
  }

  for (let i = 0; i < indices.length; i++) {
    const start = indices[i] + `\\section*{${sectionNames[i]}}`.length; // rough estimate is fine
    const end = i < indices.length - 1 ? indices[i + 1] : content.length;
    
    // Exact slice from the original string
    const sectionStart = content.indexOf('{', indices[i]) + 1;
    const sectionEnd = content.indexOf('}', sectionStart);
    const actualName = content.substring(sectionStart, sectionEnd);
    
    sections.push({
      name: actualName.replace(/\*/g, '').trim(),
      content: content.substring(sectionEnd + 1, end).trim()
    });
  }

  // Parse each section
  for (const sec of sections) {
    const secName = sec.name.toLowerCase();
    
    if (secName.includes('summary') || secName.includes('profile')) {
      summary = cleanLatex(sec.content);
    } 
    
    else if (secName.includes('skills')) {
      const lines = sec.content.split('\n');
      for (const line of lines) {
        if (line.includes('Programming Languages')) {
          const match = line.match(/Programming Languages:\s*\}([^\\.]+)/i) || line.match(/Programming Languages:\*?\s*([^\\.]+)/i);
          if (match) skills.languages = match[1].split(',').map(s => cleanLatex(s));
        } else if (line.includes('Systems')) {
          const match = line.match(/Systems\s*&\s*Architecture:\s*\}([^\\.]+)/i) || line.match(/Systems\s*&\s*Architecture:\*?\s*([^\\.]+)/i);
          if (match) skills.systems = match[1].split(',').map(s => cleanLatex(s));
        } else if (line.includes('Deep Learning')) {
          const match = line.match(/Deep Learning\s*&\s*Optimization:\s*\}([^\\.]+)/i) || line.match(/Deep Learning\s*&\s*Optimization:\*?\s*([^\\.]+)/i);
          if (match) skills.deepLearning = match[1].split(',').map(s => cleanLatex(s));
        } else if (line.includes('Offensive Security')) {
          const match = line.match(/Offensive Security:\s*\}([^\\.]+)/i) || line.match(/Offensive Security:\*?\s*([^\\.]+)/i);
          if (match) skills.offensiveSecurity = match[1].split(',').map(s => cleanLatex(s));
        }
      }
    } 
    
    else if (secName.includes('experience')) {
      // Find achievements
      // \achievement{Role}{Date}
      // followed by itemize
      const achRegex = /\\achievement\s*\{([^}]+)\}\s*\{([^}]+)\}/g;
      let expMatch;
      const expPositions: number[] = [];
      const expHeaders: { roleCompany: string; date: string }[] = [];
      
      while ((expMatch = achRegex.exec(sec.content)) !== null) {
        expPositions.push(expMatch.index);
        expHeaders.push({ roleCompany: expMatch[1], date: expMatch[2] });
      }
      
      for (let i = 0; i < expPositions.length; i++) {
        const start = expPositions[i];
        const end = i < expPositions.length - 1 ? expPositions[i + 1] : sec.content.length;
        const itemBlock = sec.content.substring(start, end);
        
        // Find bullets
        const bullets: string[] = [];
        const itemRegex = /\\item\s+([^\\%]+)/g;
        let itemMatch;
        while ((itemMatch = itemRegex.exec(itemBlock)) !== null) {
          bullets.push(cleanLatex(itemMatch[1]));
        }
        
        const parts = expHeaders[i].roleCompany.split('—').map(s => s.trim());
        const role = parts[1] || parts[0];
        const company = parts[1] ? parts[0] : 'Cybervigilance LLC';
        experience.push({
          role: cleanLatex(role),
          company: cleanLatex(company),
          date: cleanLatex(expHeaders[i].date),
          bullets
        });
      }
    } 
    
    else if (secName.includes('capabilities') || secName.includes('offensive')) {
      const achRegex = /\\achievement\s*\{([^}]+)\}\s*\{([^}]+)\}/g;
      let achMatch;
      const achPositions: number[] = [];
      const achHeaders: { title: string; date: string }[] = [];
      
      while ((achMatch = achRegex.exec(sec.content)) !== null) {
        achPositions.push(achMatch.index);
        achHeaders.push({ title: achMatch[1], date: achMatch[2] });
      }
      
      for (let i = 0; i < achPositions.length; i++) {
        const start = achPositions[i];
        const end = i < achPositions.length - 1 ? achPositions[i + 1] : sec.content.length;
        const itemBlock = sec.content.substring(start, end);
        
        const bullets: string[] = [];
        const itemRegex = /\\item\s+([^\\%]+)/g;
        let itemMatch;
        while ((itemMatch = itemRegex.exec(itemBlock)) !== null) {
          bullets.push(cleanLatex(itemMatch[1]));
        }
        
        achievements.push({
          title: cleanLatex(achHeaders[i].title),
          date: cleanLatex(achHeaders[i].date),
          bullets
        });
      }
    } 
    
    else if (secName.includes('projects')) {
      // Find projects: \project{Title}{Date}{Tech}{Link}
      const projRegex = /\\project\s*\{([^}]+)\}\s*\{([^}]+)\}\s*\{([^}]+)\}\s*\{([^}]+)\}/g;
      let projMatch;
      const projPositions: number[] = [];
      const projHeaders: { title: string; date: string; tech: string; url: string }[] = [];
      
      while ((projMatch = projRegex.exec(sec.content)) !== null) {
        projPositions.push(projMatch.index);
        projHeaders.push({
          title: projMatch[1],
          date: projMatch[2],
          tech: projMatch[3],
          url: projMatch[4]
        });
      }
      
      for (let i = 0; i < projPositions.length; i++) {
        const start = projPositions[i];
        const end = i < projPositions.length - 1 ? projPositions[i + 1] : sec.content.length;
        const itemBlock = sec.content.substring(start, end);
        
        const bullets: string[] = [];
        const itemRegex = /\\item\s+([^\\%]+)/g;
        let itemMatch;
        while ((itemMatch = itemRegex.exec(itemBlock)) !== null) {
          bullets.push(cleanLatex(itemMatch[1]));
        }
        
        projects.push({
          title: cleanLatex(projHeaders[i].title),
          date: cleanLatex(projHeaders[i].date),
          tech: cleanLatex(projHeaders[i].tech),
          url: projHeaders[i].url,
          bullets
        });
      }

      // Parse other projects line
      // \noindent\textbf{Other Projects:} \textbf{\href{https://github.com/yahya-azeem/Unixy-System}{\color{primary}Unixy-System}} ...
      const otherMatch = sec.content.match(/Other Projects:\s*([\s\S]+)$/i);
      if (otherMatch) {
        const otherStr = otherMatch[1];
        // Match \href inside
        const hrefRegex = /\\href\s*\{([^}]+)\}\s*\{[^}]*\\color\{primary\}\s*([^}]+)\}/g;
        let hrefMatch;
        while ((hrefMatch = hrefRegex.exec(otherStr)) !== null) {
          otherProjects.push({
            url: hrefMatch[1],
            title: cleanLatex(hrefMatch[2])
          });
        }
      }
    } 
    
    else if (secName.includes('education')) {
      // \noindent\textbf{\color{primary}The University of Texas at Dallas} \hfill \textit{2026 -- 2030} \\
      // Bachelor of Science in Computer Science \hfill \textit{Richardson, Texas}
      const schoolMatch = sec.content.match(/\\noindent\\textbf\s*\{[^}]*\\color\{primary\}\s*([^}]+)\}/i) || sec.content.match(/\\noindent\\textbf\s*\{([^}]+)\}/i);
      if (schoolMatch) {
        education.school = cleanLatex(schoolMatch[1]);
      }
      
      const dateMatch = sec.content.match(/\\hfill\s*\\textit\s*\{([^}]+)\}/i);
      if (dateMatch) {
        education.date = cleanLatex(dateMatch[1]);
      }
      
      const degreeMatch = sec.content.match(/\\\\([\s\S]+?)\\hfill/);
      if (degreeMatch) {
        education.degree = cleanLatex(degreeMatch[1]);
      }
      
      const locMatch = sec.content.match(/\\hfill\s*\\textit\s*\{([^}]+)\}\s*$/) || sec.content.match(/\\hfill\s*\\textit\s*\{([^}]+)\}[^}]*$/);
      if (locMatch) {
        // Grab the last \textit in the text
        const lastIdx = sec.content.lastIndexOf('\\textit{');
        if (lastIdx !== -1) {
          const locEnd = sec.content.indexOf('}', lastIdx);
          education.location = cleanLatex(sec.content.substring(lastIdx + 8, locEnd));
        }
      }
    }
  }

  return {
    contact,
    summary,
    skills,
    experience,
    achievements,
    projects,
    otherProjects,
    education
  };
}
