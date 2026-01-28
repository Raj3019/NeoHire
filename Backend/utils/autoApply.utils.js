const Application = require("../model/application.model")

function calculateSkillMatch(employeeSkills, requiredSkills) {
  if(!requiredSkills || requiredSkills.length === 0){
    return {percentage: 100, matchedSkills: [], missingSkills: [] }
  }

  if (!employeeSkills || employeeSkills.length === 0) {
    return { percentage: 0, matchedSkills: [], missingSkills: requiredSkills }
  }

  const normalizedEmployee = employeeSkills.map(s => s.toLowerCase().trim());
  const normalizedRequired = requiredSkills.map(s => s.toLowerCase().trim());

  const matchedSkills = []
  const missingSkills  = []

  normalizedRequired.forEach(skill => {
    if(normalizedEmployee.includes(skill)){
      matchedSkills.push(skill)
    } else {
      missingSkills.push(skill)
    }
  });

  const percentage = (matchedSkills.length / normalizedRequired.length) * 100

  return {
    percentage: Math.round(percentage),
    matchedSkills,
    missingSkills
  };
}

function calculateExperienceMatch(employeeYears, requiredMin, requiredMax) {
  if(requiredMin === 0 && requiredMax === 0){
    return 100
  }

  if(employeeYears >= requiredMin && employeeYears <= requiredMax){
    return 100
  }

  if(employeeYears > requiredMax){
    return 85
  }

  if (employeeYears < requiredMin) {
    const gap = requiredMin - employeeYears;
    // Lose 20% for each year short
    return Math.max(0, 100 - (gap * 20));
  }

  return 0
}


// FOR LATER USE
function calculateOverallMatch(skillMatch, experienceMatch) {
  // Skills are more important (70%), Experience less (30%)
  const SKILL_WEIGHT = 0.7;
  const EXPERIENCE_WEIGHT = 0.3;
  const overall = (skillMatch * SKILL_WEIGHT) + (experienceMatch * EXPERIENCE_WEIGHT);
  
  return Math.round(overall);
}

async function hasAlreadyApplied(employeeId, jobId) {
  const existing = await Application.findOne({JobSeeker: employeeId, job: jobId})

  return !!existing     // Return true if an application exists, otherwise false
}

module.exports = {
  calculateSkillMatch,
  calculateExperienceMatch,
  calculateOverallMatch,
  hasAlreadyApplied
}