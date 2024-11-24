import { loginSuccess } from '@/redux/slices/auth';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const OAuthRedirectPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    ///
    useEffect(() => {
        console.log("OAuthRedirectPAGE!#@!@#!#!@#");
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const nickname = urlParams.get('nickname');

        if (token && nickname) {
            localStorage.setItem('accessToken', token);
            localStorage.setItem('nickname', nickname);

            dispatch(loginSuccess({ token, user: { loginId: nickname, name: nickname } }));

            navigate(`/chat/${nickname}`);
        }
    }, [navigate]);

    return <div>Loading...</div>; // 또는 로딩 스피너 등을 표시
};

export default OAuthRedirectPage;