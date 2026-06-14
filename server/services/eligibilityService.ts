import { UserProfile, Scheme } from "../../src/types";

/**
 * Validates a citizen's profile attributes against a specific government benefit scheme definition.
 * Employs a robust scoring mechanism combined with hard policy gates.
 * 
 * @param profile The parsed citizen demographic and asset profile.
 * @param scheme The government welfare scheme configuration.
 * @returns Object including calculated eligibility status, eligibility percentage score, and detailed verdict description.
 */
export function computeEligibility(
  profile: UserProfile,
  scheme: Scheme
): { status: 'Eligible' | 'Likely Eligible' | 'Not Eligible'; score: number; reason: string } {
  
  if (!profile || !scheme) {
    return {
      status: 'Not Eligible',
      score: 0,
      reason: "Incomplete database input parameters. Both profile and scheme metadata are mandatory."
    };
  }

  let score = 55; // Base qualification score
  let status: 'Eligible' | 'Likely Eligible' | 'Not Eligible' = 'Likely Eligible';
  let reason = "Matched basic regional demographic baseline criteria.";

  // PHASE 1: GEOGRAPHIC INCLUSION VERIFICATION (Hard Policy Gate)
  if (scheme.state && scheme.state !== 'National') {
    if (!profile.state) {
      status = 'Likely Eligible';
      score = Math.max(25, score - 20);
      reason = `This scheme is primary target for residents of ${scheme.state}. Please state your residence details.`;
    } else if (profile.state.toLowerCase() !== scheme.state.toLowerCase()) {
      return {
        status: 'Not Eligible',
        score: 10,
        reason: `State constraint failed. Exclusively available to residents of ${scheme.state}. Your profile indicates residence in ${profile.state}.`
      };
    } else {
      score += 15; // Local resident matching bonus
    }
  }

  // PHASE 2: FINANCIAL / INCOME LEVEL SUITABILITY
  if (profile.annualIncome !== undefined) {
    // Specific ceiling rules for flagship schemes
    if (scheme.id === 'pm-awas' || scheme.id === 'ayushman-bharat' || scheme.id === 'national-scholarship' || scheme.id === 'ladli-behna') {
      const ceiling = scheme.id === 'pm-awas' ? 300000 : 
                      scheme.id === 'ayushman-bharat' ? 250000 :
                      scheme.id === 'national-scholarship' ? 350000 : 250000;
                      
      if (profile.annualIncome <= ceiling) {
        score += 20;
      } else {
        return {
          status: 'Not Eligible',
          score: Math.max(0, score - 45),
          reason: `Financial threshold exceeded. Annual family income of ₹${profile.annualIncome.toLocaleString()} exceeds the maximum allowed ceiling limit of ₹${ceiling.toLocaleString()} for this scheme.`
        };
      }
    } else {
      // General gradient income evaluation
      if (profile.annualIncome <= 150000) {
        score += 15;
      } else if (profile.annualIncome <= 300000) {
        score += 5;
      } else if (profile.annualIncome > 600000) {
        score -= 25;
      }
    }
  }

  // PHASE 3: CATEGORY & SECTOR-SPECIFIC CRITERIA
  const normalizedCategory = scheme.category.toLowerCase();

  // A. Farmer Criteria
  if (normalizedCategory === 'farmer') {
    if (profile.farmerStatus === true) {
      score += 25;
      if (scheme.id === 'pm-kisan') {
        if (profile.landOwner === true) {
          score += 15;
          status = 'Eligible';
          reason = "Eligible. Verified farmer profile with active landholdings matching PM-Kisan directive rules.";
        } else {
          score -= 5;
          status = 'Likely Eligible';
          reason = "Likely Eligible. Farmer status active, but proof of cultivable land title deeds is missing and must be uploaded.";
        }
      } else {
        status = 'Eligible';
        reason = "Verified active farming occupation meets core program parameters.";
      }
    } else {
      return {
        status: 'Not Eligible',
        score: Math.max(0, score - 50),
        reason: "Professional eligibility failed. This scheme targets active smallholder or marginal farmers exclusively."
      };
    }
  }

  // B. Student Criteria
  else if (normalizedCategory === 'student') {
    if (profile.studentStatus === true) {
      score += 25;
      status = 'Eligible';
      reason = "Verified active student profile matches qualification directives.";
    } else {
      return {
        status: 'Not Eligible',
        score: Math.max(0, score - 50),
        reason: "Qualification mismatch. This is an academic/student benefit and requires verified active student status."
      };
    }
  }

  // C. Business Criteria
  else if (normalizedCategory === 'business') {
    if (profile.businessOwnerStatus === true || profile.occupation === 'Business' || profile.occupation === 'Self Employed') {
      score += 25;
      status = 'Eligible';
      reason = "Verified micro-business setup or proprietary entrepreneurship matches loan/subsidy criteria.";
    } else if (profile.occupation === 'Unemployed' || profile.occupation === 'Student') {
      return {
        status: 'Not Eligible',
        score: Math.max(0, score - 30),
        reason: "Active enterprise registration or immediate intent to self-employ is required for merchant benefits."
      };
    } else {
      status = 'Likely Eligible';
      reason = "May qualify assuming intent to configure or register a micro-business enterprise.";
    }
  }

  // D. Women Specific Criteria
  else if (normalizedCategory === 'women') {
    if (profile.gender === 'Female') {
      score += 30;
      status = 'Eligible';
      reason = "Verified female demographic aligns with female social empowerment directives.";
    } else {
      return {
        status: 'Not Eligible',
        score: 0,
        reason: "Demographic restriction. This scheme is focused on support systems for female citizens."
      };
    }
  }

  // E. Senior Citizen Criteria
  else if (normalizedCategory === 'senior citizen') {
    if (profile.age !== undefined) {
      if (profile.age >= 60) {
        score += 30;
        status = 'Eligible';
        reason = "Senior citizen age qualification threshold (60+ years) successfully matched.";
      } else if (profile.age >= 18 && profile.age <= 40 && scheme.id === 'national-pension') {
        score += 20;
        status = 'Eligible';
        reason = "Age meets the valid 18-40 contribution entry age bracket for Atal Pension Yojana.";
      } else {
        return {
          status: 'Not Eligible',
          score: Math.max(0, score - 40),
          reason: `Age bracket mismatch. This program requires senior status (60+ years). Current age is ${profile.age}.`
        };
      }
    } else {
      status = 'Likely Eligible';
      reason = "Age verification proof must be provided to confirm senior status.";
    }
  }

  // PHASE 4: FINAL INTEGRATED SCORING CALCULATION
  const completenessBonus = profile.profileCompleteness ? Math.floor(profile.profileCompleteness / 5) : 0;
  let finalScore = Math.min(98, score + completenessBonus);

  // Normalize final status vs scores to build real deterministic ranges
  if (status === 'Eligible' && finalScore < 85) {
    finalScore = 85 + (finalScore % 13);
  } else if (status === 'Likely Eligible' && finalScore > 84) {
    finalScore = 70 + (finalScore % 14);
  }

  return {
    status,
    score: Math.max(15, Math.floor(finalScore)),
    reason
  };
}
