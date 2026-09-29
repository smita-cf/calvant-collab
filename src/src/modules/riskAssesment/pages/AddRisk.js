// import React from 'react';
// import { useHistory } from 'react-router-dom';
// import MultiStepFormManager from '../components/forms/MultiStepFormManager';
// import '../styles/GlobalStyles.css';

// const AddRisk = () => {
//   const history = useHistory();

//   const handleSubmit = (formData) => {
//     console.log('Risk Assessment Data:', formData);
//     // Here you would typically save the data to your backend or state management
//     // For now, we'll just redirect to the saved risks page
//     alert('Risk Assessment submitted successfully!');
//     history.push('/risk-assessment');
//   };

//   const handleCancel = () => {
//     history.push('/risk-assessment');
//   };

//   return (
//     <div className="page-container">
//       <div className="page-header">
//         <h1>Add New Risk Assessment</h1>
//       </div>
      
//       <MultiStepFormManager 
//         onSubmit={handleSubmit}
//         onCancel={handleCancel}
//       />
//     </div>
//   );
// };

// export default AddRisk;


// import React from 'react';
// import { useLocation } from 'react-router-dom';
// import MultiStepFormManager from '../components/forms/MultiStepFormManager';

// const AddRisk = () => {
//   const location = useLocation();
//   const focusArea = location.state?.focusArea || 'risk';

//   const handleSubmit = (formData) => {
//     console.log('Risk Assessment Data:', formData);
//   };

//   return (
//     <div>
//       <MultiStepFormManager onSubmit={handleSubmit} focusArea={focusArea} />

//           </div>
          
    
//   );
// };

// export default AddRisk;





import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import MultiStepFormManager from '../components/forms/MultiStepFormManager';

const AddRisk = () => {
  const history = useHistory();
  const location = useLocation();
  const focusArea = location.state?.focusArea || 'risk';

  const handleSubmit = (formData) => {
    console.log('Risk Assessment Data:', formData);
    // submission logic here...
  };

  return (
    <div className="page-container" style={{ padding: '30px 40px 0px 40px' }}>
      

      <button
        onClick={() => history.push('/risk-assessment')}
        style={{
          position: 'fixed',
          top: "28px",
           right: "120px",
          marginBottom: '30px',
          padding: '10px 22px',
          borderRadius: '6px',
          backgroundColor: '#005FCC',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '1rem',
          boxShadow: '0 4px 8px rgba(0, 95, 204, 0.3)',
          transition: 'all 0.3s ease',
          display: 'inline-flex',
          alignItems: 'center'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = '#0046a3';
          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 70, 163, 0.5)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = '#005FCC';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 95, 204, 0.3)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        ← Back to Dashboard
      </button>

      <MultiStepFormManager onSubmit={handleSubmit} focusArea={focusArea} />
    </div>
  );
};

export default AddRisk;

