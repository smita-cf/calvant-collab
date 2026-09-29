import React from "react";
import { useRouter } from "next/navigation";
import GoalForm from "../GoalForm/GoalForm";

const EditGoal = ({ goal, onUpdateGoal,goals  }) => {
  const router = useRouter();

  if (!goal) return <p>No Risk Added</p>;

  const handleUpdate = (data) => {
    onUpdateGoal(data);
    router.push("/"); // redirect after save
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
