import { useState, useEffect } from "react";
import axios from "axios";
import './DietPlan.css';

const DIET_PLANS = {
  0: { // Low Carb (diet_type: 0)
    name: "Low Carb Diet",
    description: "Focuses on reducing carbohydrate intake to promote fat loss and stabilize blood sugar.",
    baseCalories: 1800, // Changed from calories to baseCalories
    macros: { protein: 40, carbs: 20, fats: 40 },
    meals: [
      {
        name: "Breakfast",
        time: "8:00 AM",
        baseCalories: 450,
        protein: 25,
        carbs: 15,
        fats: 30,
        items: ["Scrambled eggs (3)", "Avocado (½)", "Spinach", "Green tea"],
        tips: "Add vegetables for fiber"
      },
      {
        name: "Morning Snack",
        time: "11:00 AM",
        baseCalories: 150,
        protein: 10,
        carbs: 5,
        fats: 10,
        items: ["Greek yogurt (1 cup)", "Almonds (10 pieces)"],
        tips: "Choose full-fat yogurt"
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        baseCalories: 550,
        protein: 35,
        carbs: 20,
        fats: 35,
        items: ["Grilled chicken breast", "Mixed green salad", "Olive oil dressing", "Broccoli"],
        tips: "Load up on non-starchy vegetables"
      },
      {
        name: "Afternoon Snack",
        time: "4:00 PM",
        baseCalories: 150,
        protein: 15,
        carbs: 5,
        fats: 10,
        items: ["Protein shake", "Celery sticks"],
        tips: "Stay hydrated"
      },
      {
        name: "Dinner",
        time: "7:00 PM",
        baseCalories: 500,
        protein: 30,
        carbs: 15,
        fats: 35,
        items: ["Salmon fillet", "Asparagus", "Cauliflower rice", "Lemon butter sauce"],
        tips: "Eat at least 3 hours before bed"
      }
    ],
    benefits: [
      "Rapid initial weight loss",
      "Reduced blood sugar levels",
      "Improved mental clarity",
      "Better appetite control"
    ],
    tips: [
      "Drink 3-4 liters of water daily",
      "Monitor electrolyte intake",
      "Include healthy fats",
      "Avoid processed foods"
    ]
  },
  
  1: { // Balanced (diet_type: 1)
    name: "Balanced Diet",
    description: "A well-rounded approach with equal emphasis on all macronutrients for sustainable health.",
    baseCalories: 2200,
    macros: { protein: 30, carbs: 45, fats: 25 },
    meals: [
      {
        name: "Breakfast",
        time: "8:00 AM",
        baseCalories: 500,
        protein: 20,
        carbs: 60,
        fats: 15,
        items: ["Oatmeal (1 cup)", "Banana", "Walnuts", "Greek yogurt"],
        tips: "Add berries for antioxidants"
      },
      {
        name: "Morning Snack",
        time: "11:00 AM",
        baseCalories: 200,
        protein: 10,
        carbs: 25,
        fats: 8,
        items: ["Apple", "Peanut butter (2 tbsp)", "Whole grain crackers"],
        tips: "Combine carbs with protein"
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        baseCalories: 650,
        protein: 35,
        carbs: 70,
        fats: 20,
        items: ["Brown rice", "Grilled chicken", "Steamed vegetables", "Lentil soup"],
        tips: "Include a variety of colors"
      },
      {
        name: "Afternoon Snack",
        time: "4:00 PM",
        baseCalories: 250,
        protein: 15,
        carbs: 30,
        fats: 10,
        items: ["Smoothie (protein powder, berries, spinach)", "Whole grain toast"],
        tips: "Great pre-workout snack"
      },
      {
        name: "Dinner",
        time: "7:00 PM",
        baseCalories: 600,
        protein: 40,
        carbs: 55,
        fats: 22,
        items: ["Quinoa", "Tofu/Paneer curry", "Mixed vegetable stir-fry", "Salad"],
        tips: "Keep dinner moderate in size"
      }
    ],
    benefits: [
      "Sustainable long-term approach",
      "Improved energy levels",
      "Better digestion",
      "Heart health benefits"
    ],
    tips: [
      "Eat colorful vegetables",
      "Choose whole grains",
      "Include plant-based proteins",
      "Practice portion control"
    ]
  },
  
  2: { // High Protein (diet_type: 2)
    name: "High Protein Diet",
    description: "Emphasizes protein intake to support muscle growth, recovery, and satiety.",
    baseCalories: 2600,
    macros: { protein: 45, carbs: 35, fats: 20 },
    meals: [
      {
        name: "Breakfast",
        time: "8:00 AM",
        baseCalories: 600,
        protein: 40,
        carbs: 45,
        fats: 25,
        items: ["Egg white omelette (6 whites)", "Whole wheat toast", "Cottage cheese", "Tomatoes"],
        tips: "Include vegetables for volume"
      },
      {
        name: "Morning Snack",
        time: "11:00 AM",
        baseCalories: 300,
        protein: 30,
        carbs: 25,
        fats: 10,
        items: ["Protein shake", "Rice cakes", "Banana"],
        tips: "Consume within 1 hour post-workout"
      },
      {
        name: "Lunch",
        time: "1:00 PM",
        baseCalories: 700,
        protein: 50,
        carbs: 60,
        fats: 20,
        items: ["Lean beef steak", "Sweet potato", "Green beans", "Greek salad"],
        tips: "Weigh protein portions for accuracy"
      },
      {
        name: "Afternoon Snack",
        time: "4:00 PM",
        baseCalories: 300,
        protein: 35,
        carbs: 20,
        fats: 12,
        items: ["Tuna salad", "Whole grain bread", "Cucumber slices"],
        tips: "Good pre-training meal"
      },
      {
        name: "Dinner",
        time: "7:00 PM",
        baseCalories: 700,
        protein: 55,
        carbs: 50,
        fats: 25,
        items: ["Grilled fish", "Brown rice", "Steamed broccoli", "Avocado"],
        tips: "Casein protein digests slowly overnight"
      }
    ],
    benefits: [
      "Enhanced muscle growth and repair",
      "Increased metabolic rate",
      "Reduced appetite and cravings",
      "Improved body composition"
    ],
    tips: [
      "Space protein intake every 3-4 hours",
      "Stay hydrated to process protein",
      "Combine with strength training",
      "Monitor kidney health if pre-existing conditions"
    ]
  }
};

const DietPlan = () => {
  const token = localStorage.getItem("token");
  const [mlResult, setMlResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("meals");
  const [selectedDay, setSelectedDay] = useState("Monday");

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  /* ========= FETCH USER DATA ========= */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUserInfo(res.data);
        
        // Get ML data from either field
        if (res.data.ml && Object.keys(res.data.ml).length > 0) {
          setMlResult(res.data.ml);
        } else if (res.data.mlResult && Object.keys(res.data.mlResult).length > 0) {
          setMlResult(res.data.mlResult);
        }
        
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [token]);

  /* ========= GET DIET TYPE FROM ML ========= */
  const getDietType = () => {
    if (!mlResult) return 1; // Default to Balanced
    
    // Check both possible field names
    const dietType = mlResult.diet_type !== undefined ? mlResult.diet_type : 
                    mlResult.dietType !== undefined ? mlResult.dietType : 1;
    
    // Ensure it's 0, 1, or 2
    return dietType === 0 ? 0 : dietType === 2 ? 2 : 1;
  };

  /* ========= ADJUST CALORIES BASED ON USER GOAL ========= */
  const adjustCalories = (baseCalories) => {
    if (!userInfo?.goal) return baseCalories;
    
    const goal = userInfo.goal;
    const mlCalories = mlResult?.calories;
    
    // Use ML calories if available, otherwise adjust based on goal
    if (mlCalories) {
      return mlCalories;
    }
    
    // Adjust based on goal
    switch (goal) {
      case "weight_loss":
        return baseCalories - 300;
      case "muscle_gain":
        return baseCalories + 400;
      default:
        return baseCalories;
    }
  };

  /* ========= ADJUST MEAL CALORIES TO MATCH TARGET ========= */
  const getAdjustedMeals = (baseMeals, targetCalories, basePlanCalories) => {
    if (targetCalories === basePlanCalories) {
      return baseMeals.map(meal => ({
        ...meal,
        calories: meal.baseCalories
      }));
    }
    
    // Calculate adjustment ratio
    const ratio = targetCalories / basePlanCalories;
    
    // Adjust each meal proportionally
    return baseMeals.map(meal => ({
      ...meal,
      calories: Math.round(meal.baseCalories * ratio),
      protein: Math.round(meal.protein * ratio),
      carbs: Math.round(meal.carbs * ratio),
      fats: Math.round(meal.fats * ratio)
    }));
  };

  /* ========= CALCULATE TOTAL FROM ADJUSTED MEALS ========= */
  const calculateTotalCalories = (adjustedMeals) => {
    return adjustedMeals.reduce((sum, meal) => sum + meal.calories, 0);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your personalized diet plan...</p>
      </div>
    );
  }

  const dietType = getDietType();
  const plan = DIET_PLANS[dietType];
  const targetCalories = adjustCalories(plan.baseCalories);
  const adjustedMeals = getAdjustedMeals(plan.meals, targetCalories, plan.baseCalories);
  const totalDailyCalories = calculateTotalCalories(adjustedMeals);

  // Ensure total matches target (adjust for rounding errors)
  const calorieDifference = targetCalories - totalDailyCalories;
  const finalMeals = [...adjustedMeals];
  
  // Distribute small difference to the largest meal
  if (calorieDifference !== 0 && finalMeals.length > 0) {
    const largestMealIndex = finalMeals.reduce((maxIndex, meal, index) => 
      meal.calories > finalMeals[maxIndex].calories ? index : maxIndex, 0);
    
    finalMeals[largestMealIndex] = {
      ...finalMeals[largestMealIndex],
      calories: finalMeals[largestMealIndex].calories + calorieDifference
    };
  }

  return (
    <div className="diet-plan-container">
      {/* HEADER */}
      <div className="diet-plan-header">
        <div>
          <h1 className="page-title">Personalized Diet Plan</h1>
          <p className="page-subtitle">
            AI-generated nutrition plan based on your fitness profile
          </p>
        </div>
        <div className="diet-plan-meta">
          <div className="meta-item">
            <span className="meta-label">Calorie Target</span>
            <span className="meta-value">{targetCalories} kcal</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Diet Type</span>
            <span className="meta-value">{plan.name}</span>
          </div>
          {userInfo?.goal && (
            <div className="meta-item">
              <span className="meta-label">Goal</span>
              <span className="meta-value">
                {userInfo.goal === "weight_loss" ? "Weight Loss" :
                 userInfo.goal === "muscle_gain" ? "Muscle Gain" :
                 "Maintenance"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="card tabs-card">
        <div className="tabs-navigation">
          <button
            className={`tab-btn ${activeTab === "meals" ? "active" : ""}`}
            onClick={() => setActiveTab("meals")}
          >
            Daily Meals
          </button>
          <button
            className={`tab-btn ${activeTab === "macros" ? "active" : ""}`}
            onClick={() => setActiveTab("macros")}
          >
            Macros & Nutrients
          </button>
          <button
            className={`tab-btn ${activeTab === "guidelines" ? "active" : ""}`}
            onClick={() => setActiveTab("guidelines")}
          >
            Guidelines
          </button>
        </div>
      </div>

      {/* MACROS TAB */}
      {activeTab === "macros" && (
        <div className="card macros-card">
          <h3 className="section-title">Daily Macronutrient Targets</h3>
          <div className="macro-grid">
            <div className="macro-item protein">
              <div className="macro-label">Protein</div>
              <div className="macro-value">{plan.macros.protein}%</div>
              <div className="macro-amount">
                {Math.round((targetCalories * plan.macros.protein / 100) / 4)}g
              </div>
            </div>
            <div className="macro-item carbs">
              <div className="macro-label">Carbs</div>
              <div className="macro-value">{plan.macros.carbs}%</div>
              <div className="macro-amount">
                {Math.round((targetCalories * plan.macros.carbs / 100) / 4)}g
              </div>
            </div>
            <div className="macro-item fats">
              <div className="macro-label">Fats</div>
              <div className="macro-value">{plan.macros.fats}%</div>
              <div className="macro-amount">
                {Math.round((targetCalories * plan.macros.fats / 100) / 9)}g
              </div>
            </div>
          </div>
          <div className="calorie-summary">
            <div className="summary-item">
              <span className="summary-label">Target Calories:</span>
              <span className="summary-value">{targetCalories} kcal</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Base Plan Calories:</span>
              <span className="summary-value">{plan.baseCalories} kcal</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Adjustment:</span>
              <span className={`summary-value ${targetCalories > plan.baseCalories ? 'positive' : targetCalories < plan.baseCalories ? 'negative' : ''}`}>
                {targetCalories > plan.baseCalories ? '+' : ''}{targetCalories - plan.baseCalories} kcal
              </span>
            </div>
          </div>
          <p className="plan-description">{plan.description}</p>
        </div>
      )}

      {/* MEALS TAB */}
      {activeTab === "meals" && (
        <>
          {/* DAY SELECTOR */}
          <div className="card day-selector-card">
            <div className="day-selector-header">
              <h3 className="section-title">Weekly Meal Plan</h3>
              <div className="total-calories">
                Total Daily: <strong>{targetCalories} kcal</strong>
                <span className="calorie-match">
                  ✓ Matches your target
                </span>
              </div>
            </div>
            <div className="day-selector">
              {days.map((day) => (
                <button
                  key={day}
                  className={`day-btn ${selectedDay === day ? "active" : ""}`}
                  onClick={() => setSelectedDay(day)}
                >
                  {day}
                </button>
              ))}
            </div>
            <p className="day-note">
              Meal plan shown for <strong>{selectedDay}</strong> • 
              Meal calories adjusted proportionally to match your target
            </p>
          </div>

          {/* MEAL PLAN TABLE */}
          <div className="card meal-plan-card">
            <div className="meals-table">
              <div className="table-header-row">
                <div className="meal-col">Meal & Time</div>
                <div className="calories-col">Calories</div>
                <div className="macros-col">Macros (P/C/F)</div>
                <div className="food-col">Food Items</div>
                <div className="tips-col">Tips</div>
              </div>
              
              {finalMeals.map((meal, index) => {
                // Calculate percentage of total daily calories
                const caloriePercentage = ((meal.calories / targetCalories) * 100).toFixed(1);
                
                return (
                  <div key={index} className="meal-row">
                    <div className="meal-col">
                      <div className="meal-name">{meal.name}</div>
                      <div className="meal-time">{meal.time}</div>
                      <div className="meal-percentage">{caloriePercentage}% of daily</div>
                    </div>
                    <div className="calories-col">
                      <div className="calorie-value">{meal.calories}</div>
                      <div className="calorie-label">kcal</div>
                    </div>
                    <div className="macros-col">
                      <div className="macros-values">
                        <span className="protein-value">{meal.protein}g</span>
                        <span className="carbs-value">{meal.carbs}g</span>
                        <span className="fats-value">{meal.fats}g</span>
                      </div>
                      <div className="macros-bars">
                        <div className="protein-bar" style={{ 
                          width: `${(meal.protein / (meal.protein + meal.carbs + meal.fats)) * 100}%` 
                        }}></div>
                        <div className="carbs-bar" style={{ 
                          width: `${(meal.carbs / (meal.protein + meal.carbs + meal.fats)) * 100}%` 
                        }}></div>
                        <div className="fats-bar" style={{ 
                          width: `${(meal.fats / (meal.protein + meal.carbs + meal.fats)) * 100}%` 
                        }}></div>
                      </div>
                    </div>
                    <div className="food-col">
                      <ul className="food-items">
                        {meal.items.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="tips-col">
                      <div className="meal-tips">{meal.tips}</div>
                    </div>
                  </div>
                );
              })}
              
              {/* TOTALS ROW */}
              <div className="totals-row">
                <div className="meal-col">
                  <div className="total-label">TOTAL DAILY</div>
                </div>
                <div className="calories-col">
                  <div className="total-value">{targetCalories}</div>
                  <div className="total-label">kcal</div>
                </div>
                <div className="macros-col">
                  <div className="macros-totals">
                    <span className="protein-total">
                      {finalMeals.reduce((sum, meal) => sum + meal.protein, 0)}g
                    </span>
                    <span className="carbs-total">
                      {finalMeals.reduce((sum, meal) => sum + meal.carbs, 0)}g
                    </span>
                    <span className="fats-total">
                      {finalMeals.reduce((sum, meal) => sum + meal.fats, 0)}g
                    </span>
                  </div>
                </div>
                <div className="food-col">
                  <div className="meal-count">
                    {finalMeals.length} meals
                  </div>
                </div>
                <div className="tips-col">
                  <div className="calorie-match-badge">
                    ✓ Target matched
                  </div>
                </div>
              </div>
            </div>
            
            {/* CALORIE DISTRIBUTION CHART */}
            <div className="calorie-distribution">
              <h4 className="distribution-title">Calorie Distribution</h4>
              <div className="distribution-bars">
                {finalMeals.map((meal, index) => {
                  const percentage = ((meal.calories / targetCalories) * 100).toFixed(1);
                  return (
                    <div key={index} className="distribution-bar">
                      <div 
                        className="bar-fill"
                        style={{ height: `${percentage * 1.5}px` }}
                        title={`${meal.name}: ${meal.calories} kcal (${percentage}%)`}
                      ></div>
                      <div className="bar-label">{meal.name}</div>
                      <div className="bar-value">{meal.calories} kcal</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* GUIDELINES TAB */}
      {activeTab === "guidelines" && (
        <div className="card guidelines-card">
          <div className="guidelines-grid">
            <div className="guidelines-section">
              <h3 className="section-title">Key Benefits</h3>
              <ul className="guidelines-list">
                {plan.benefits.map((benefit, index) => (
                  <li key={index}>
                    <span className="benefit-icon">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <div className="guidelines-section">
              <h3 className="section-title">Important Tips</h3>
              <ul className="guidelines-list">
                {plan.tips.map((tip, index) => (
                  <li key={index}>
                    <span className="tip-icon">💡</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="nutrition-section">
            <h3 className="section-title">Nutrition Guidelines</h3>
            <div className="nutrition-content">
              <p>
                <strong>Meal Timing:</strong> Aim to eat every 3-4 hours to maintain stable energy levels and metabolism.
              </p>
              <p>
                <strong>Hydration:</strong> Drink at least 3-4 liters of water daily. Increase during workouts or hot weather.
              </p>
              <p>
                <strong>Food Quality:</strong> Prioritize whole, unprocessed foods over packaged or processed options.
              </p>
              <p>
                <strong>Flexibility:</strong> Feel free to substitute foods with similar macronutrient profiles. Consistency is key.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MEAL PREP TIPS */}
      <div className="card meal-prep-card">
        <h3 className="section-title">Meal Preparation Tips</h3>
        <div className="meal-prep-content">
          <p>
            <strong>Portion Control:</strong> Use measuring cups or a food scale to ensure accurate calorie intake.
          </p>
          <p>
            <strong>Adjusting Portions:</strong> If you need {targetCalories} kcal but the base plan is {plan.baseCalories} kcal, 
            adjust all portions by approximately {((targetCalories / plan.baseCalories) * 100).toFixed(0)}%.
          </p>
          <p>
            <strong>Smart Substitutions:</strong> Swap ingredients based on availability while maintaining similar macros.
          </p>
          <p>
            <strong>Track Progress:</strong> Use a food tracking app to monitor adherence and make adjustments as needed.
          </p>
        </div>
      </div>

      {/* IMPORTANT NOTES */}
      <div className="card notes-card">
        <h3 className="section-title">Important Notes</h3>
        <div className="notes-content">
          <p>
            <strong>Calorie Adjustment:</strong> Your daily calorie target ({targetCalories} kcal) is 
            {targetCalories > plan.baseCalories ? ' higher' : targetCalories < plan.baseCalories ? ' lower' : ' the same as'} 
            the base plan ({plan.baseCalories} kcal). All meal portions have been adjusted proportionally.
          </p>
          <p>
            <strong>Individual Variation:</strong> Nutritional needs vary based on age, gender, activity level, and metabolism.
            Monitor how your body responds and adjust accordingly.
          </p>
          <p>
            <strong>Sustainability:</strong> The best diet is one you can maintain long-term. Focus on building healthy habits.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DietPlan;