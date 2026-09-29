import React from "react";
import { useHistory } from "react-router-dom";
import GoalForm from "../GoalForm/GoalForm";

const EditGoal = ({ goal, onUpdateGoal,goals  }) => {
  const history = useHistory();

  if (!goal) return <p>No Risk Added</p>;

  const handleUpdate = (data) => {
    onUpdateGoal(data);
    history.push("/"); // redirect after save
  };

  return (
  <GoalForm
    initialData={goal}
    onSubmit={handleUpdate}
    buttonLabel="Update Risk"
    goals={goals}
  />
);
};

export default EditGoal;
