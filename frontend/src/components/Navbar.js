// import { Link } from 'react-router-dom'
// import { useLogout } from '../hooks/useLogout'
// import { useAuthContext } from '../hooks/useAuthContext'

const Navbar = () => {
  // const { logout } = useLogout()
  // const { user } = useAuthContext()
  
  // const handleClick = () => {
  //   logout()
  // }

  return (
    <header className="bg-white p-4 md:p-6 flex justify-start items-center"> 
      <img src="/kk.png" alt="EMCON Logo" className="w-24 h-auto mr-6" />
      <nav className="flex space-x-6">
        <a href="/" className="hover:text-[#15aacf]">Home</a>
        <a href="/hospitals" className="hover:text-[#15aacf]">Find Hospitals</a>
        <a href="#insurance" className="hover:text-[#15aacf]">Insurance</a>
        <a href="#donations" className="hover:text-[#15aacf]">Donations</a>
        <a href="#medical-card" className="hover:text-[#15aacf]">Medical Card</a>
      </nav>
    </header>
  )
}

export default Navbar