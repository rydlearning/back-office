import React, { useState } from "react";
import PropTypes from "prop-types";
import { Row, Col, Alert, Container, FormFeedback, Input, Label, Form } from "reactstrap";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import logo from "../../assets/images/favicon.png";
import CarouselPage from "./CarouselPage";
import axios from "axios";

const ForgetPasswordPage = ({ history }) => {
  document.title = "Forget Password | RYD Admin";

  const [forgetError, setForgetError] = useState("");
  const [forgetSuccessMsg, setForgetSuccessMsg] = useState("");

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().required("Please Enter Your Email"),
    }),
    onSubmit: async (values) => {
      try {
        // Simulate API call to reset password
        // Replace this with your actual API endpoint
        const apiUrl = process.env.REACT_APP_API_URL;
        await axios.post(apiUrl, values);
        setForgetSuccessMsg("Password reset instructions sent successfully");
        setForgetError("");
      } catch (error) {
        console.error("Error resetting password:", error);
        setForgetError("Failed to reset password");
        setForgetSuccessMsg("");
      }
    },
  });

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
                        <h5 className="mb-0">Reset Password</h5>
                        <p className="text-muted mt-2">Reset Password with RYD Admin.</p>
                      </div>

                      {forgetError && <Alert color="danger" style={{ marginTop: "13px" }}>{forgetError}</Alert>}
                      {forgetSuccessMsg && <Alert color="success" style={{ marginTop: "13px" }}>{forgetSuccessMsg}</Alert>}

                      <Form
                        className="custom-form mt-4"
                        onSubmit={(e) => {
                          e.preventDefault();
                          validation.handleSubmit();
                          return false;
                        }}
                      >
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
                            invalid={validation.touched.email && !!validation.errors.email}
                          />
                          {validation.touched.email && validation.errors.email && (
                            <FormFeedback type="invalid">{validation.errors.email}</FormFeedback>
                          )}
                        </div>

                        <Row className="mb-3">
                          <Col className="text-end">
                            <button
                              className="btn btn-primary w-100 waves-effect waves-light"
                              type="submit"
                            >
                              Reset
                            </button>
                          </Col>
                        </Row>
                      </Form>

                      <div className="mt-5 text-center">
                        <p className="text-muted mb-0">Remember It ?  <Link to="/auth/login" className="text-primary fw-semibold"> Sign In </Link> </p>
                      </div>
                    </div>
                    <div className="mt-4 mt-md-5 text-center">
                      <p className="mb-0">© {new Date().getFullYear()} RYD Admin | SlantApp Group</p>
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
  );
};

ForgetPasswordPage.propTypes = {
  history: PropTypes.object,
};

export default ForgetPasswordPage;
