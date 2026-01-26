require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('../model/employee.model');
const Recruiter = require('../model/recruiter.model');
const Job = require('../model/job.model');
const Application = require('../model/application.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Sample data
const countries = ['India', 'USA', 'UK', 'Canada', 'Germany', 'Australia'];
const skills = ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB', 'TypeScript', 'AWS'];
const jobTitles = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'DevOps Engineer'];
const companies = ['TechCorp', 'InnovateLabs', 'DataDrive', 'CloudFirst', 'AIVentures'];

// Helper to generate random item from array
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seedDatabase() {
  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Employee.deleteMany({});
    await Recruiter.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});

    // ============= CREATE RECRUITERS =============
    console.log('👔 Creating recruiters...');
    const recruiters = [];
    
    for (let i = 1; i <= 5; i++) {
      const recruiter = await Recruiter.create({
        betterAuthUserId: `recruiter-seed-${i}`,
        fullName: `Recruiter ${i}`,
        email: `recruiter${i}@example.com`,
        phone: `99000000${i.toString().padStart(2, '0')}`,
        country: randomItem(countries),
        currentCity: 'Mumbai',
        currentEmployer: randomItem(companies),
        currentRole: 'HR Manager',
        status: i === 5 ? 'Suspended' : 'Active', // One suspended for testing
        headline: 'Experienced HR Professional',
        experienceYears: randomNumber(3, 15)
      });
      recruiters.push(recruiter);
    }
    console.log(`   ✓ Created ${recruiters.length} recruiters`);

    // ============= CREATE CANDIDATES =============
    console.log('👤 Creating candidates...');
    const candidates = [];
    
    for (let i = 1; i <= 20; i++) {
      const candidate = await Employee.create({
        betterAuthUserId: `candidate-seed-${i}`,
        fullName: `Candidate ${i}`,
        email: `candidate${i}@example.com`,
        phone: `98000000${i.toString().padStart(2, '0')}`,
        country: randomItem(countries),
        currentCity: randomItem(['Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai']),
        currentJobTitle: randomItem(jobTitles),
        currentCompany: randomItem(companies),
        status: i <= 2 ? 'Suspended' : 'Active', // Two suspended
        skills: skills.slice(0, randomNumber(2, 5)),
        experienceYears: randomNumber(0, 10),
        headline: `${randomItem(jobTitles)} with ${randomNumber(1, 8)} years experience`,
        education: {
          graduation: {
            collegeName: 'IIT Delhi',
            degree: 'B.Tech',
            specialization: 'Computer Science',
            passingYear: 2020
          }
        }
      });
      candidates.push(candidate);
    }
    console.log(`   ✓ Created ${candidates.length} candidates`);

    // ============= CREATE JOBS =============
    console.log('💼 Creating jobs...');
    const jobs = [];
    
    const jobData = [
      { title: 'Senior React Developer', company: 'TechCorp', skills: ['React', 'JavaScript', 'TypeScript'] },
      { title: 'Node.js Backend Engineer', company: 'InnovateLabs', skills: ['Node.js', 'MongoDB', 'AWS'] },
      { title: 'Full Stack Developer', company: 'DataDrive', skills: ['React', 'Node.js', 'MongoDB'] },
      { title: 'Python Data Engineer', company: 'AIVentures', skills: ['Python', 'AWS', 'MongoDB'] },
      { title: 'Junior Frontend Developer', company: 'CloudFirst', skills: ['JavaScript', 'React'] },
      { title: 'DevOps Engineer', company: 'TechCorp', skills: ['AWS', 'Node.js'] },
      { title: 'React Native Developer', company: 'InnovateLabs', skills: ['React', 'JavaScript', 'TypeScript'] },
      { title: 'Backend Developer (Python)', company: 'DataDrive', skills: ['Python', 'MongoDB'] },
    ];

    for (let i = 0; i < jobData.length; i++) {
      const recruiter = recruiters[i % recruiters.length];
      const job = await Job.create({
        title: jobData[i].title,
        description: `We are looking for a skilled ${jobData[i].title} to join our team at ${jobData[i].company}.`,
        jobRequirements: 'Bachelor\'s degree in Computer Science or related field. Strong problem-solving skills.',
        location: randomItem(['Remote', 'Mumbai', 'Bangalore', 'Delhi', 'Hyderabad']),
        jobType: randomItem(['Full-time', 'Part-time', 'Contract']),
        workType: randomItem(['Remote', 'On-site', 'Hybrid']),
        companyName: jobData[i].company,
        skillsRequired: jobData[i].skills,
        experienceLevel: randomItem(['Entry', 'Mid', 'Senior']),
        salary: {
          min: randomNumber(5, 15) * 100000,
          max: randomNumber(16, 30) * 100000,
          currency: 'INR'
        },
        status: i >= 6 ? 'Closed' : 'Active', // 2 closed jobs
        postedBy: recruiter._id,
        openings: randomNumber(1, 5),
        industry: 'Technology'
      });
      jobs.push(job);
    }
    console.log(`   ✓ Created ${jobs.length} jobs`);

    // ============= CREATE APPLICATIONS =============
    console.log('📝 Creating applications...');
    let applicationCount = 0;
    const statuses = ['Applied', 'Pending', 'Shortlist', 'Accept', 'Reject'];

    for (const job of jobs) {
      // Each job gets 3-8 random applicants
      const numApplicants = randomNumber(3, 8);
      const shuffledCandidates = [...candidates].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < numApplicants && i < shuffledCandidates.length; i++) {
        const candidate = shuffledCandidates[i];
        
        const application = await Application.create({
          job: job._id,
          JobSeeker: candidate._id,
          postedBy: job.postedBy,
          resume: `https://example.com/resumes/${candidate._id}.pdf`,
          status: randomItem(statuses),
          aiMatchScore: {
            overallScore: randomNumber(50, 95),
            skillsMatch: randomNumber(40, 100),
            experienceMatch: randomNumber(30, 100),
            educationMatch: randomNumber(50, 100)
          },
          appliedAt: new Date(Date.now() - randomNumber(0, 14) * 24 * 60 * 60 * 1000) // Random date within last 14 days
        });

        // Update job's appliedBy array
        await Job.findByIdAndUpdate(job._id, {
          $push: {
            appliedBy: {
              applicant: candidate._id,
              status: application.status,
              appliedAt: application.appliedAt
            }
          }
        });

        // Update candidate's appliedJobs
        await Employee.findByIdAndUpdate(candidate._id, {
          $push: { appliedJobs: application._id }
        });

        applicationCount++;
      }
    }
    console.log(`   ✓ Created ${applicationCount} applications`);

    // ============= SUMMARY =============
    console.log('\n📊 Seed Summary:');
    console.log(`   • Recruiters: ${recruiters.length}`);
    console.log(`   • Candidates: ${candidates.length}`);
    console.log(`   • Jobs: ${jobs.length} (${jobs.filter(j => j.status === 'Active').length} active)`);
    console.log(`   • Applications: ${applicationCount}`);
    console.log('\n✅ Database seeded successfully!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();