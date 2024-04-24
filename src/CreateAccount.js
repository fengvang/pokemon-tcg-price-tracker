import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
// eslint-disable-next-line
import { app } from "./firebase";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";

import {
  Container,
  Form,
  Button,
  Image,
  Row,
  InputGroup,
} from "react-bootstrap";
import * as Images from "./Icons";
import * as MuiIcon from "./MuiIcons";

function CreateAccount() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(68);
  const provider = new GoogleAuthProvider();

  function addUserToDB(userId, name, email) {
    const db = getDatabase();

    set(ref(db, "users/" + userId), {
      username: name,
      email: email,
    });
  }

  function userIsLoggedIn() {
    const auth = getAuth();

    onAuthStateChanged(auth, (user) => {
      if (user) return true;
      else return false;
    });
  }

  const googleLogin = () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...

        addUserToDB(user.uid, user.displayName, user.email);

        if (userIsLoggedIn) {
          const userInfo = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
          };

          localStorage.setItem("user", JSON.stringify(userInfo));
        }

        setTimeout(() => {
          navigate("/");
        }, 3000);
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);

        console.error(errorCode, errorMessage, email, credential);
        // ...
      });
  };

  const createAccount = (event) => {
    const auth = getAuth();

    event.preventDefault();

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        updateProfile(user, {
          displayName: username,
        })
          .then(() => {
            addUserToDB(user.uid, username, email);

            if (userIsLoggedIn) {
              if (!user.emailVerified) {
                sendEmailVerification(user).then(() => {
                  console.log("sending email");
                });
              } else console.log("email already verified");

              const userInfo = {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
              };

              localStorage.setItem("user", JSON.stringify(userInfo));
            }

            console.log("Username updated.");
          })
          .catch((error) => {
            console.error(error);
          });

        setTimeout(() => {
          navigate("/");
        }, 1500);
      })
      .catch((error) => {
        console.error(error.code);
        console.error(error.message);
      });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (headerRef.current) {
      const height = headerRef.current.offsetHeight;
      setHeaderHeight(height);
    }
  }, []);

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ height: `calc(100vh - 2.5 * ${headerHeight}px)` }}
    >
      <div className="login-container">
        <Row
          className="d-flex justify-content-center"
          style={{ marginTop: "25px" }}
        >
          <Link to="/" style={{ marginLeft: "25px" }}>
            <MuiIcon.ArrowBackIcon /> Return
          </Link>
          <Image src={Images.masterball} style={{ width: "80px" }} />
        </Row>
        <div className="form-container">
          <Form className="login-form">
            <Form.Group>
              <Form.Label className="mb-0">Username</Form.Label>
              <Form.Control
                type="input"
                placeholder="Username"
                className="mb-3"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <Form.Label className="mb-0">Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-3"
              />

              <Form.Label className="mb-0">Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mb-3 password-input"
                />
                {showPassword ? (
                  <MuiIcon.EyeOff
                    className="show-password-icon"
                    onClick={togglePasswordVisibility}
                  />
                ) : (
                  <MuiIcon.Eye
                    className="show-password-icon"
                    onClick={togglePasswordVisibility}
                  />
                )}
              </InputGroup>

              <span className="mb-0 d-flex justify-content-center">
                Already have an account?{" "}
                <Link to="/login" className="mx-2">
                  Log in
                </Link>
              </span>

              <Button className="create-account-btn" onClick={createAccount}>
                Create Account
              </Button>

              <hr />
              <div className="socials-container">
                Or create account with your socials
              </div>

              <div className="socials-container justify-content-evenly mt-2 mb-4">
                <MuiIcon.GoogleIcon
                  className="google-icon"
                  onClick={googleLogin}
                />

                <MuiIcon.FacebookIcon className="facebook-icon" />

                <MuiIcon.XIcon className="x-icon" />
              </div>
            </Form.Group>
          </Form>
        </div>
      </div>
    </Container>
  );
}

export default CreateAccount;
