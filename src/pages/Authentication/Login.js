import React, { useState } from "react";
import { Row, Col, Container, Form, Input, FormFeedback, Label } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import withRouter from "../../components/Common/withRouter";
import axios from "axios";
import * as Yup from "yup";
import { useFormik } from "formik";

import { baseUrl } from '../../Network';

// Use baseUrl in combination with other endpoints
const parentEndpoint = `${baseUrl}/admin/parent/all`;
const childEndpoint = `${baseUrl}/admin/child/all`;

// import images
import logo from "../../assets/images/favicon.png";

//Import config
import CarouselPage from "./CarouselPage";
import { createSelector } from "reselect";

const Login = (props) => {
  const [passwordShow, setPasswordShow] = useState(false);
  const navigate = useNavigate(); // Use useNavigate for routing

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().required("Please Enter Your Email"),
      password: Yup.string().required("Please Enter Your Password"),
    }),
    onSubmit: async (values, { setFieldError }) => {
      try {
        const response = await axios.post(
          `${baseUrl}/admin/auth/login`,  values)
        if (response.data.status) {
          // Store token in localStorage
          localStorage.setItem('token', response.data.data.token);
          // Pass token to the dashboard
          navigate('/dashboard', { state: { token: response.data.data.token } }); // Pass token in state
        } else {
          setFieldError("email", "Invalid login credentials"); // Set login error message to email field error
        }
      } catch (error) {
        setFieldError("email", "An error occurred while logging in."); // Set generic login error message to email field error
      }
    },
  });

  document.title = "Login | RYD Admin";

  return (
    <React.Fragment>
      <div className="auth-page">
        <Container fluid className="p-0">
          <Row className="g-0">
            <Col lg={4} md={5} className="col-xxl-3">
              <div className="auth-full-page-content d-flex p-sm-5 p-4">
                <div className="w-100">
                  <div className="d-flex flex-column h-100">
                    <div className="mb-4 mb-md-5 text-center">
                      <Link to="/dashboard" className="d-block auth-logo">
                        <img src={logo} alt="" height="28" /> <span className="logo-txt">RYD Admin</span>
                      </Link>
                    </div>

                    <div className="avatar-xl mx-auto">
                      <div className="avatar-title bg-light-subtle text-primary h1 rounded-circle">
                        <i className="bx bxs-user"></i>
                      </div>
                    </div>

                    <div className="auth-content my-auto">
                      <div className="text-center">
                        <h5 className="mb-0">Welcome Back !</h5>
                        <p className="text-muted mt-2">Sign in to continue to RYD Admin.</p>
                      </div>
                      <Form
                        className="custom-form mt-4 pt-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          validation.handleSubmit();
                          return false;
                        }}>
                        {validation.errors.email && (
                          <div className="mb-3 text-danger">{validation.errors.email}</div>
                        )}
                        <div className="mb-3">
                          <Label className="form-label">Email</Label>
                          <Input
                            name="email"
                            className="form-control"
                            placeholder="Enter email"
                            type="email"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.email || ""}
                            invalid={
                              validation.touched.email && validation.errors.email ? true : false
                            }
                          />

                        </div>

                        <div className="mb-3">
                          <div className="d-flex align-items-start">
                            <div className="flex-grow-1">
                              <Label className="form-label">Password</Label>
                            </div>
                            <div className="flex-shrink-0">
                              <div className="">
                                <Link to="/auth/forgot" className="text-muted">Forgot password?</Link>
                              </div>
                            </div>
                          </div>
                          <div className="input-group auth-pass-inputgroup">
                            <Input
                              name="password"
                              value={validation.values.password || ""}
                              type={passwordShow ? "text" : "password"}
                              placeholder="Enter Password"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              invalid={
                                validation.touched.password && validation.errors.password ? true : false
                              }
                            />
                            <button onClick={() => setPasswordShow(!passwordShow)} className="btn btn-light shadow-none ms-0" type="button" id="password-addon"><i className="mdi mdi-eye-outline"></i></button>
                            {validation.touched.password && validation.errors.password ? (
                              <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
                            ) : null}
                          </div>
                        </div>

                        <div className="row mb-4">
                          <div className="col">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="remember-check"
                              />
                              <label
                                className="form-check-label"
                                htmlFor="remember-check"
                              >
                                Remember me
                              </label>
                            </div>

                            <div className="mt-3 d-grid">
                              <button
                                className="btn btn-primary btn-block"
                                type="submit"
                              >
                                Log In
                              </button>
                            </div>
                          </div>
                        </div>
                      </Form>

                      <div className="mt-5 text-center">
                        <p className="text-muted mb-0">Don't have an account ? | Talk with Devs </p>
                      </div>
                    </div>
                    <div className="mt-4 mt-md-5 text-center">
                      <p className="mb-0">© {new Date().getFullYear()} RYD Admin. | SlantApp Group</p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            <CarouselPage />
          </Row>
        </Container>
      </div>
    </React.Fragment>
  )
}

export default withRouter(Login);
