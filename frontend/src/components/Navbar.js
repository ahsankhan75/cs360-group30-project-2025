import { Link } from 'react-router-dom'
import { useLogout } from '../hooks/useLogout'
import { useAuthContext } from '../hooks/useAuthContext'

const Navbar = () => {
  const { logout } = useLogout()
  const { user } = useAuthContext()
  
  const handleClick = () => {
    logout()
  }

  return (
    <header>
      <div className="container">
        <nav>
          {user && (
            <div>
              <span>{user.email}</span>
              <button onClick={handleClick}>Log out</button>
            </div>
          )}
          {!user && (
            <div>
          
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar