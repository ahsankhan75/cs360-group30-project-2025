

// import React, { useState } from 'react';

// const BloodRequestRow = ({ request }) => {
//   const [accepted, setAccepted] = useState(false);

//   return (
//     <tr className="hover:bg-gray-50 transition text-md">
//       <td className="px-6 py-5 w-[14%]">{request.hospitalName}</td>
//       <td className="px-6 py-5 w-[14%]">{request.requestId}</td>
//       <td className="px-6 py-5 w-[10%]">{request.bloodType}</td>
//       <td className="px-6 py-5 w-[14%]">{request.urgencyLevel}</td>
//       <td className="px-6 py-5 w-[12%]">{request.location}</td>
//       <td className="px-6 py-5 w-[20%]">
//         {new Date(request.datePosted).toLocaleDateString()}
//         <br />
//         <span className="text-sm text-gray-500">
//           {new Date(request.datePosted).toLocaleTimeString()}
//         </span>
//       </td>
//       <td className="px-6 py-5 w-[8%] text-center font-bold">{request.unitsNeeded}</td>
//       <td className="px-6 py-5 w-[8%] text-center">
//         <button
//           onClick={() => setAccepted(true)}
//           disabled={accepted}
//           className={`px-4 py-2 rounded text-sm font-medium transition ${
//             accepted
//               ? 'bg-green-100 text-green-700 cursor-default'
//               : 'bg-green-500 hover:bg-green-600 text-white'
//           }`}
//         >
//           {accepted ? 'Accepted' : 'Accept'}
//         </button>
//       </td>
//     </tr>
//   );
// };

// export default BloodRequestRow;

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';


// const BloodRequestRow = ({ request }) => {
//   const [accepted, setAccepted] = useState(false);
//   const navigate = useNavigate();

//   const handleRowClick = () => {
//     navigate(`/requests/${request.requestId}`);
//   };

//   return (
//     <tr
//       className="hover:bg-gray-50 transition text-md cursor-pointer"
//       onClick={handleRowClick}
//     >
//       <td className="px-6 py-5 w-[14%]">{request.hospitalName}</td>
//       <td className="px-6 py-5 w-[14%]">{request.requestId}</td>
//       <td className="px-6 py-5 w-[10%]">{request.bloodType}</td>
//       <td className="px-6 py-5 w-[14%]">{request.urgencyLevel}</td>
//       <td className="px-6 py-5 w-[12%]">{request.location}</td>
//       <td className="px-6 py-5 w-[20%]">
//         {new Date(request.datePosted).toLocaleDateString()}
//         <br />
//         <span className="text-sm text-gray-500">
//           {new Date(request.datePosted).toLocaleTimeString()}
//         </span>
//       </td>
//       <td className="px-6 py-5 w-[8%] text-center font-bold">{request.unitsNeeded}</td>
//       <td
//         className="px-6 py-5 w-[8%] text-center"
//         onClick={(e) => {
//           e.stopPropagation(); // prevent row click
//           setAccepted(true);
//         }}
//       >
//         <button
//           disabled={accepted}
//           className={`px-4 py-2 rounded text-sm font-medium transition ${
//             accepted
//               ? 'bg-green-100 text-green-700 cursor-default'
//               : 'bg-green-500 hover:bg-green-600 text-white'
//           }`}
//         >
//           {accepted ? 'Accepted' : 'Accept'}
//         </button>
//       </td>
//     </tr>
//   );
// };

// export default BloodRequestRow;

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// const BloodRequestRow = ({ request }) => {
//   const [accepted, setAccepted] = useState(false);
//   const navigate = useNavigate();

//   const handleRowClick = () => {
//     navigate(`/requests/${request.requestId}`);
//   };

//   return (
//     <tr
//       className="hover:bg-gray-100 hover:shadow-sm transition duration-200 text-md cursor-pointer"
//       onClick={handleRowClick}
//     >
//       <td className="px-6 py-5 w-[14%]">{request.hospitalName}</td>
//       <td className="px-6 py-5 w-[14%]">{request.requestId}</td>
//       <td className="px-6 py-5 w-[10%]">{request.bloodType}</td>
//       <td className="px-6 py-5 w-[14%]">{request.urgencyLevel}</td>
//       <td className="px-6 py-5 w-[12%]">{request.location}</td>
//       <td className="px-6 py-5 w-[20%]">
//         {new Date(request.datePosted).toLocaleDateString()}
//         <br />
//         <span className="text-sm text-gray-500">
//           {new Date(request.datePosted).toLocaleTimeString()}
//         </span>
//       </td>
//       <td className="px-6 py-5 w-[8%] text-center font-bold">{request.unitsNeeded}</td>
//       <td
//         className="px-6 py-5 w-[8%] text-center"
//         onClick={(e) => {
//           e.stopPropagation(); // prevent navigation on Accept click
//           setAccepted(true);
//         }}
//       >
//         <button
//           disabled={accepted}
//           className={`px-4 py-2 rounded text-sm font-medium transition ${
//             accepted
//               ? 'bg-green-100 text-green-700 cursor-default'
//               : 'bg-green-500 hover:bg-green-600 text-white'
//           }`}
//         >
//           {accepted ? 'Accepted' : 'Accept'}
//         </button>
//       </td>
//     </tr>
//   );
// };

// export default BloodRequestRow;


// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// const BloodRequestRow = ({ request }) => {
//   const [accepted, setAccepted] = useState(false);
//   const navigate = useNavigate();

//   const handleRowClick = () => {
//     navigate(`/requests/${request.requestId}`);
//   };

//   return (
//     <tr className="group cursor-pointer" onClick={handleRowClick}>
//       {[
//         request.hospitalName,
//         request.requestId,
//         request.bloodType,
//         request.urgencyLevel,
//         request.location,
//         <>
//           {new Date(request.datePosted).toLocaleDateString()}
//           <br />
//           <span className="text-sm text-gray-500">
//             {new Date(request.datePosted).toLocaleTimeString()}
//           </span>
//         </>,
//         request.unitsNeeded,
//         <button
//           disabled={accepted}
//           onClick={(e) => {
//             e.stopPropagation();
//             setAccepted(true);
//           }}
//           className={`px-4 py-2 rounded text-sm font-medium transition ${
//             accepted
//               ? 'bg-green-100 text-green-700 cursor-default'
//               : 'bg-green-500 hover:bg-green-600 text-white'
//           }`}
//         >
//           {accepted ? 'Accepted' : 'Accept'}
//         </button>,
//       ].map((content, index) => (
//         <td key={index} className="px-6 py-5 w-[12%]">
//           <div className="group-hover:bg-gray-100 group-hover:shadow-sm rounded-md px-2 py-2 transition duration-200">
//             {content}
//           </div>
//         </td>
//       ))}
//     </tr>
//   );
// };

// export default BloodRequestRow;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BloodRequestRow = ({ request }) => {
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate(`/requests/${request.requestId}`);
  };

  return (
    <tr
      onClick={handleRowClick}
      className="cursor-pointer transition duration-200 hover:bg-gray-300"
    >
      <td className="p-4">{request.hospitalName}</td>
      <td className="p-4">{request.requestId}</td>
      <td className="p-4">{request.bloodType}</td>
      <td className="p-4">{request.urgencyLevel}</td>
      <td className="p-4">{request.location}</td>
      <td className="p-4">
        {new Date(request.datePosted).toLocaleDateString()}
        <br />
        <span className="text-sm text-gray-500">
          {new Date(request.datePosted).toLocaleTimeString()}
        </span>
      </td>
      <td className="p-4 text-center">{request.unitsNeeded}</td>
      <td
        className="p-4 text-center"
        onClick={(e) => {
          e.stopPropagation();
          setAccepted(true);
        }}
      >
        <button
          disabled={accepted}
          className={`px-4 py-2 rounded text-sm font-medium transition ${
            accepted
              ? 'bg-green-100 text-green-700'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {accepted ? 'Accepted' : 'Accept'}
        </button>
      </td>
    </tr>
  );
};

export default BloodRequestRow;