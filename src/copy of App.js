import Link from 'next/link';
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import "./App.css";
import GoalList from "./components/GoalList/GoalList";
import NewGoal from "./components/NewGoal/NewGoal";
import EditGoal from "./components/EditGoal/EditGoal";

function App() {
  const [Coursegoals, setCoursegoals] = useState([]);

  // Add Risk
  const addnewGoalHandler = (newGoal) => {
    setCoursegoals((prev) => prev.concat(newGoal));
  };

  // Update Risk
  const updateGoalHandler = (updatedGoal) => {
    setCoursegoals((prev) =>
      prev.map((goal) => (goal.id === updatedGoal.id ? updatedGoal : goal))
    );
  };

  return (
    <Router>
      <div className="course-goals">
        <h2>Risk Assessment</h2>
        <nav>
          <Link to="/add">Add Risk</Link> | <Link to="/">Saved Risk</Link> |{" "}
          <Link to="/templates">Templates</Link>
        </nav>

        <Switch>
          <Route exact path="/">
            <GoalList goals={Coursegoals} />
          </Route>

          <Route path="/add">
            <NewGoal onAddGoal={addnewGoalHandler} goals={Coursegoals} />
          </Route>

          <Route
            path="/edit/:id"
            render={(props) => {
              const goalId = props.match.params.id;
              const goal = Coursegoals.find((g) => g.id === goalId);
              return (
                <EditGoal
                  goal={goal}
                  onUpdateGoal={updateGoalHandler}
                  goals={Coursegoals}
                />
              );
            }}
          />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
