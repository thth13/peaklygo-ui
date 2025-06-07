import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { CodeResponse, useGoogleLogin } from '@react-oauth/google';

interface GoogleLoginButtonProps {
  googleLogin: (code: CodeResponse) => Promise<void>;
}

const GoogleLoginButton = ({ googleLogin }: GoogleLoginButtonProps) => {
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (codeResponse: CodeResponse) => googleLogin(codeResponse),
    flow: 'auth-code',
    redirect_uri: 'postmessage',
  });

  return (
    <button
      onClick={handleGoogleLogin}
      type="button"
      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <FontAwesomeIcon icon={faGoogle} className="fa-google text-[#4285F4] mr-2" />
      <span>Sign in with Google</span>
    </button>
  );
};

export default GoogleLoginButton;
