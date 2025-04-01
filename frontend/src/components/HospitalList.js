// const HospitalList = ({ hospitals }) => {
//     return (
//       <div className="mt-4">
//         {hospitals.length === 0 ? (
//           <p className="text-center text-gray-500">No hospitals found.</p>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {hospitals.map((hospital) => (
//               <div key={hospital._id} className="p-4 border rounded-lg shadow-md">
//                 <h3 className="text-lg font-bold">{hospital.name}</h3>
//                 <p className="text-sm text-gray-600">{hospital.location.address}</p>
//                 <p><strong>ICU Beds:</strong> {hospital.resources.icu_beds}</p>
//                 <p><strong>Ventilators:</strong> {hospital.resources.ventilators}</p>
//                 <p><strong>Blood Bank:</strong> {hospital.resources.blood_bank ? "Yes" : "No"}</p>
//                 <p><strong>Medical Imaging:</strong> {hospital.resources.medical_imaging.join(", ")}</p>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   };
  
//   export default HospitalList;

const HospitalList = ({ hospitals }) => {
  return (
    <div className="mt-4">
      {hospitals.length === 0 ? (
        <p className="text-center text-gray-500">No hospitals found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hospitals.map((hospital) => (
            <div key={hospital._id} className="p-4 border rounded-lg shadow-md bg-teal-100">
              <h3 className="text-lg font-bold">{hospital.name}</h3>
              <p className="text-sm text-gray-600">{hospital.location.address}</p>
              <p><strong>ICU Beds:</strong> {hospital.resources.icu_beds}</p>
              <p><strong>Ventilators:</strong> {hospital.resources.ventilators}</p>
              <p><strong>Blood Bank:</strong> {hospital.resources.blood_bank ? "Yes" : "No"}</p>
              <p><strong>Medical Imaging:</strong> {hospital.resources.medical_imaging.join(", ")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HospitalList;