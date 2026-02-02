const Plan = require("../model/plan.model")

const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find({isActive: true}).sort({displayOrder: 1})
    return res.status(200).json({
      success: true,
      message: "Plans feteched Successfully",
      data: plans
    })
  } catch (error) {
    console.error("Error fetching plans: ", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
      error: error.message
  })
  }
}

const getPlansByUserType = async (req, res) => {
  try {
    const {userType} = req.params

    const validType = ["Employee", "Recruiter"]
    
    if (!validType.includes(userType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user type. Must be 'Employee' or 'Recruiter'.",
      })
    }
    const plans = await Plan.find({
      isActive: true,
      userType:{$in: [userType, "both"]}
    }).sort({displayOrder: 1})

    return res.status(200).json({
      success: true,
      message: `Plans for ${userType} fetched successfully`,
      data: plans
    })
  } catch (error) {
    console.error("Error fetching plans by user type: ", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
      error: error.message
    })
  }
}

//Get single plan by slug
const getPlanBySlug  = async (req, res) => {
  try {
    const {slug} = req.params
    
    const plan = await Plan.find({slug: slug.toLowerCase()})

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      })
    }

    return res.status(200).json({
      success: true,
      message: "Plan fetched Successfully",
      data: plan
    })
  } catch (error) {
    console.error("Error fetching plans by user type: ", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
      error: error.message
    })
  }
}

//Create Plan (Admin only)
const createPlan = async (req, res) => {
  try {
    // Destructure all fields from request body
    // This extracts each property from the JSON sent by client
    const { name, slug, description, price, userType, features, displayOrder } = req.body;

    // Validate required fields
    // !name checks if name is undefined, null, or empty string
    if (!name || !slug || !userType) {
      return res.status(400).json({
        success: false,
        message: "Name, slug, and userType are required",
      });
    }

    // Check if plan with same slug already exists
    // We use slug for uniqueness because it's used in URLs
    const existingPlan = await Plan.findOne({ 
      slug: slug.toLowerCase() 
    });

    if (existingPlan) {
      // 409 = Conflict (resource already exists)
      return res.status(409).json({
        success: false,
        message: "Plan with this slug already exists",
      });
    }

    // Create new plan document
    // We spread the features object to merge with defaults
    const newPlan = new Plan({
      name,
      slug: slug.toLowerCase(),
      description: description || "",
      price: {
        monthly: price.monthly,
        currency: price.currency || "USD",
      },
      userType,
      features: {
        // Set defaults for all features, override with provided values
        resumeRoasts: features.resumeRoasts,
        autoApplyPerDay: features.autoApplyPerDay,
        jobApplicationPerDay: features.jobApplicationPerDay,
        jobPostPerMonth: features.jobPostPerMonth,
        prioritySupport: features.prioritySupport || false,
        analytics: features.analytics,
        additionalFeatures: features.additionalFeatures || new Map(),
      },
      displayOrder: displayOrder,
      isActive: true, 
    });

    await newPlan.save();

    return res.status(201).json({
      success: true,
      message: "Plan created successfully",
      data: newPlan,
    });
  } catch (error) {
    console.error("Error creating plan:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Plan with this name or slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create plan",
      error: error.message,
    });
  }
};


//Update Plan (Admin Only)

const updatePlan = async (req, res) => {
  try {
    const {id} = req.params
    const updateData = req.body

    // Prevent slug from changing
    if (updateData.slug) {
      delete updateData.slug
    }

    const updatePlan = await Plan.findByIdAndUpdate(
      id,
      updateData,
      {new: true, runValidators: true}
    )

    if (!updatePlan) {
      return res.status(404).json({
        success: true,
        message: "Plan not found"
      })
    }

    return res.status(200).json({
      success: true,
      message: "Plan updated Successfully",
      data: updatePlan
    })
  } catch (error) {
    console.error("Error updating plan: ", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update plan",
      error: error.message
    })
  }
}

// Delete Plan (Admin only) soft delete

const deletePlan = async (req, res) => {
  try {
    const {id} = req.params

    // instead of deleting we set isActive to false
    const plan = await Plan.findByIdAndUpdate(
      id,
      {isActive: false},
      {new: true}
    )

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      })
    }

    return res.status(200).json({
      success: true,
      message: "Plan deactivated Successfully",
      data: plan
    })
  } catch (error) {
    console.error("Error deleting plan:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete plan",
      error: error.message,
    });
  }
}

//TOGGLE PLAN STATUS (Admin Only)
//Quickly enable/disable a plan

const togglePlanStatus = async (req, res) => {
  try {
    const {id} = req.params

    const plan = await Plan.findById(id)

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      })
    }

    plan.isActive = !plan.isActive

    await plan.save()

    return res.status(200).json({
      success: true,
      message: `Plan ${plan.isActive ? "activated" : "deactivated"} successfully`,
      data: plan
    })
  } catch (error) {
    console.error("Error toggling plan status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle plan status",
      error: error.message,
    });
  }
}

// Get ALL plan for admin (including inActive one)

const getAllPlansAdmin = async (req, res) => {
  try {
    const plans = await Plan.find().sort({userType: 1, displayOrder: 1})

    return res.status(200).json({
      success: true,
      message: "All plans fetched successfully",
      data: plans,
      stats:{
        total: plans.length,
        active: plans.filter((p) => p.isActive).length,
        inactive: plans.filter((p) => !p.isActive).length
      }
    })
  } catch (error) {
    console.error("Error fetching all plans:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
      error: error.message,
    });
  }
}

module.exports = {
  getAllPlans,
  getPlansByUserType,
  getPlanBySlug,
  createPlan,
  updatePlan,
  deletePlan,
  togglePlanStatus,
  getAllPlansAdmin
}