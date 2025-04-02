// import React from 'react';
// import BloodRequestItem from './BloodRequestItem';

// const BloodRequestList = ({ requests }) => {
//   return (
//     <div className="grid grid-cols-1 gap-4">
//       {requests.map((request) => (
//         <BloodRequestItem key={request.requestId} request={request} />
//       ))}
//     </div>
//   );
// };

// export default BloodRequestList;

import React from 'react';
import BloodRequestItem from './BloodRequestItem';

const BloodRequestList = ({ requests }) => {
  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <BloodRequestItem key={request.requestId} request={request} />
      ))}
    </div>
  );
};

export default BloodRequestList;