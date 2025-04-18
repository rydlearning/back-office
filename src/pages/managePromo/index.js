// Import necessary modules/components
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DeleteModal from "../../components/Common/DeleteModal";
import * as Yup from "yup";
import { useFormik } from "formik";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import axios from "axios";
import withAuth from "../withAuth";
import CountrySelect from "../CountrySelect";
import { baseUrl } from '../../Network';

import {
  Col,
  Container,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  Tooltip,
  Form,
  Label,
  Input,
  FormFeedback,
  Button,
} from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { calculateDebt } from "../../utils";
import FeatherIcon from "feather-icons-react";

const ManagePromo = () => {
  const [promos, setPromos] = useState([]);
  const [promo, setPromo] = useState({});
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isApprove, setIsApprove] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [discount, setDiscount] = useState("");
  const [title, setTitle] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [countryList, setCountryList] = useState([]);
  const [email, setEmail] = useState("");
  const [timeGroup, setTimeGroup] = useState([]);
  const [slot, setSlot] = useState([]);
  const [phone, setPhone] = useState("");
  const [editTooltipOpen, setEditTooltipOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [additionalFields, setadditionalFields] = useState([]);
  const [fields, setFields] = useState([]);
  const [checked, setChecked] = useState(false);
  const [timeGroups, setTimeGroups] = useState([]);
  const [kidInputs, setKidInputs] = useState([]);


  const getCountries = async () => {
    try {
      const response = await axios.get(
        "https://countriesnow.space/api/v0.1/countries/states"
      );
      setCountryList(response.data.data);
    } catch (error) {
      console.error("Error fetching countries", error);
    }
  };

  useEffect(() => {
    getCountries()
  }, [])


  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: promo.title || "",
      firstName: promo.firstName || "",
      lastName: promo.lastName || "",
      email: promo.email || "",
      address: promo.address || "",
      country: promo.country || "",
      phone: promo.phone || "",
      timeGroupId: promo.timeGroupId || "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Please Enter Promo Tile"),
      address: Yup.string().required("Please enter address"),
      country: Yup.string().required("Country is required"),
      firstName: Yup.string().required("Please enter first name"),
      lastName: Yup.string().required("Please enter last name"),
      email: Yup.string().email("Invalid email address"),
      phone: Yup.number().required("please enter phone numner"),
      timeGroupId: Yup.number().required("Choose time group"),
    }),

    onSubmit: async (values) => {
      const newPromo = {
        title: values.title,
        address: values.address,
        country: values.country,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        timeGroupId: Number(values.timeGroupId),
        additionalFields: additionalFields,
        slot: slot
      }
      let response;

      if (isEdit) {
        response = await axios.put(
          `${baseUrl}/admin/promo/edit/${promo.id}`,
          newPromo
        );
        toast.success("Promo updated successfully");
      } else {

        response = await axios.post(
          `${baseUrl}/admin/promo/create`,
          newPromo
        );
        toast.success("Promo created successfully");
      }

      const responseData = response.data;
      setPromos([...promos, responseData]);

      toggle();
    },
  });


  useEffect(() => {
    //Title
    window.document.title = "Promo - RYD Admin"
    fetchPromos();
  }, [modal]);

  const fetchPromos = async () => {
    try {
      const response = await axios.get(`${baseUrl}/admin/promo/all`);
      const responseTG = await axios.get(`${baseUrl}/admin/timegroup/all`);

      setTimeGroup(responseTG.data.data);
      setPromos(response.data.data);
      setLoading(false); // Update loading state after data fetch
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const toggle = () => {
    setModal(!modal);
  };

  const handleEditClick = (promo) => {
    setPromo(promo);
    setIsEdit(true);
    toggle();
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleActionChange = (action) => {
    validation.setFieldValue('action', action);
  };


  const filteredPromos = promos.filter(promo =>
    promo.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDisablePromo = async (id) => {
    setLoading(true)
    try {
      const response = await axios.put(`${baseUrl}/admin/promo/disable/${id}`);
      if (!response.status) {
        toast.error(response.message);
        return;
      }
      toast.success("Promo disabled successfully");
      const responseData = response.data;
      const updatedPromos = promos.map((p) =>
        p.id === promo.id ? { ...p, ...responseData } : p
      );
      setPromos(updatedPromos);
      fetchPromos()
    } catch (error) {
      toast.error("Failed to disable promo");
    }
  };

  const handleEnablePromo = async (id) => {
    setLoading(true)
    try {
      const response = await axios.put(`${baseUrl}/admin/promo/enable/${id}`);
      if (!response.status) {
        toast.error(response.message);
        return;
      }
      toast.success("Promo enabled successfully");
      const responseData = response.data;
      const updatedPromos = promos.map((p) =>
        p.id === promo.id ? { ...p, ...responseData } : p
      );
      setPromos(updatedPromos);
      fetchPromos()
    } catch (error) {
      toast.error("Failed to enable promo");
    }
  };


  const addField = () => {
    setFields([...fields, {
      id: Date.now(),
      label: '',
      type: 'text',
      required: checked
    }]);
  };

  const removeField = (id) => {
    setFields(fields.filter(field => field.id !== id));
    setadditionalFields(fields.filter(field => field.id !== id));
  };

  const updateField = (id, updates) => {
    const updatedFields = fields.map(field =>
      field.id === id ? { ...field, ...updates } : field
    );
    setFields(updatedFields);
    setadditionalFields(updatedFields);
  };

  function getLabels(data) {
    if (Array.isArray(data)) {
      return data.map(item => item.label).join(',\n');
    }
    return "none"; // or any other default value you'd like
  }

  useEffect(() => {
    if (validation.values.timeGroupId) {
      const selectedGroup = timeGroup.find(t => t.id === Number(validation.values.timeGroupId));
      if (selectedGroup) {
        try {

          // Parse the times string
          let parsedTimes;
          if (typeof selectedGroup.times === 'string') {
            // If it's a string, try parsing
            parsedTimes = JSON.parse(selectedGroup.times);
          } else if (Array.isArray(selectedGroup.times)) {
            // If it's already an array, use directly
            parsedTimes = selectedGroup.times;
          } else if (selectedGroup.times && typeof selectedGroup.times === 'object') {
            // If it's an object, convert to array or handle appropriately
            parsedTimes = Object.values(selectedGroup.times);
          }

          // Handle both array formats
          const formattedTimes = Array.isArray(parsedTimes[0])
            ? parsedTimes  // Already in grouped format
            : [parsedTimes]; // Single time or ungrouped times - wrap in array

          setTimeGroups(formattedTimes);
          // Initialize kid inputs with empty values for each group
          setKidInputs(new Array(formattedTimes.length).fill(0));
        } catch (error) {
          console.error('Error parsing times:', error);
          setTimeGroups([]);
          setKidInputs([]);
        }
      }
    } else {
      setTimeGroups([]);
      setKidInputs([]);
    }
  }, [validation.values.timeGroupId, timeGroup]);

  const handleKidInputChange = (index, value) => {
    const newKidInputs = [...kidInputs];
    newKidInputs[index] = Number(value);
    setKidInputs(newKidInputs);

    // Create the formatted data for backend
    const formattedData = timeGroups.map((_, idx) => ({
      index: idx,
      numberOfKid: newKidInputs[idx]
    }));

    setSlot(formattedData);

  };

  const formatTimeSlotGroup = (timeSlotGroup) => {
    return Array.isArray(timeSlotGroup)
      ? timeSlotGroup
        .map(slot => `${slot.dayText} ${slot.timeText}`)
        .join(', ')
      : `${timeSlotGroup.dayText} ${timeSlotGroup.timeText}`;
  };


  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Dashboard" breadcrumbItem="Manage Promos" />
          <Row>
            <Col lg="12">
              <Row className="align-items-center">
                <Col md={6}>
                  <div className="mb-3">
                    <h5 className="card-title">
                      Promo List{" "}
                      <span className="text-muted fw-normal ms-2">
                        ({promos.length})
                      </span>
                    </h5>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 mb-3">
                    <div>
                      <Input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={handleSearch}
                      />
                    </div>
                    <div>
                      <button
                        className="btn btn-light"
                        onClick={() => {
                          setPromo({});
                          setIsEdit(false);
                          handleActionChange('add')
                          toggle();
                        }}>
                        <i className="bx bx-plus me-1"></i> Add New Promo
                      </button>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col xl="12">
                  {loading ? (
                    <div className="text-center mt-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : filteredPromos.length === 0 ? (
                    <div className="text-center mt-5">
                      <h3>No data available</h3>
                    </div>
                  ) : (
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Promo Title</th>
                          <th>Head of Promo</th>
                          <th>Address</th>
                          <th>email</th>
                          <th>Phone</th>
                          <th>A-Fields</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPromos.map((p, index) => {
                          let additionalFields;
                          try {
                            additionalFields = typeof p.additionalFields === 'string' ? JSON.parse(p.additionalFields) : p.additionalFields;
                          } catch (e) {
                            additionalFields = []; // Handle parsing error
                          }
                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{p?.title}</td>
                              <td>{p?.firstName + " " + p?.lastName}</td>
                              <td>{p?.address}</td>
                              <td>{p?.email}</td>
                              <td>{p.phone}</td>
                              <td>{getLabels(additionalFields)}</td>
                              <td>{p.status ? "Active" : "InActive"}</td>
                              <td>
                                <div className="d-flex gap-3">
                                  <>
                                    {/* <Tooltip
                                    isOpen={editTooltipOpen}
                                    target="edit"
                                    toggle={() => setEditTooltipOpen(!editTooltipOpen)}
                                    placement="top"
                                    delay={{ show: 100, hide: 100 }}
                                  >
                                    Edit
                                  </Tooltip>
                                  <Link
                                    className="text-success"
                                    to="#"
                                    id="edit"
                                    onMouseEnter={() => setEditTooltipOpen(true)}
                                    onMouseLeave={() => setEditTooltipOpen(false)}
                                    onClick={() => {
                                      handleUpdateClick(p);
                                    }}
                                  >
                                    <i className="mdi mdi-pencil font-size-18"></i>
                                  </Link> */}
                                    {p.status ?
                                      <Link
                                        className="text-danger"
                                        onClick={() => {
                                          if (confirm("Do you really want to DISABLE " + p?.title + " ?")) {
                                            handleDisablePromo(p.id)
                                          }
                                        }}
                                        id="manage"
                                      >
                                        <span className="">Disable</span>
                                      </Link> : <a href="#"
                                        className="text-success"
                                        onClick={() => {
                                          if (confirm("Do you really want to ENABLE " + p?.title + " ?")) {
                                            handleEnablePromo(p.id)
                                          }
                                        }}>
                                        Enable</a>}
                                    <Link
                                      className="text-[#1671D9]"
                                      to={`/promo/dashboard/${p.id}`}
                                      id="manage"
                                    >
                                      <span className="">Manage Promo</span>
                                    </Link>
                                    <Link
                                      className="text-success"
                                      to="#"
                                      onClick={() => {
                                        handleEditClick(p);
                                      }}
                                    >
                                      <i className="mdi mdi-pencil font-size-18"></i>
                                    </Link>
                                  </>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>


                  )}
                  <Modal isOpen={modal} toggle={toggle}>
                    <ModalHeader toggle={toggle}>
                        {isEdit ? "Edit Promo" : "Add New Promo"}
                    </ModalHeader>
                    <ModalBody>
                      <Form onSubmit={validation.handleSubmit}>
                        <Row>
                          <Col xs={12}>
                            <div className="mb-3">
                              <Label className="form-label">Promo title</Label>
                              <Input
                                name="title"
                                type="text"
                                placeholder="Enter promo title"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.title || title}
                                invalid={
                                  validation.touched.title &&
                                  validation.errors.title
                                }
                              />
                              <FormFeedback type="invalid">
                                {validation.errors.title}
                              </FormFeedback>
                            </div>
                            <div className="mb-3">
                              <Label className="form-label">Address</Label>
                              <Input
                                name="address"
                                type="text"
                                placeholder="Enter address"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.address || address}
                                invalid={
                                  validation.touched.address &&
                                  validation.errors.address
                                }
                              />
                              <FormFeedback type="invalid">
                                {validation.errors.address}
                              </FormFeedback>
                            </div>
                            <Row>
                              <div className="mb-3 col-md-6">
                                <Label className="form-label">Country Or Registration</Label>
                                <Input
                                  type="select"
                                  name="country"
                                  onChange={validation.handleChange}
                                  onBlur={validation.handleBlur}
                                  value={validation.values.country || country}
                                  invalid={
                                    validation.touched.country &&
                                    validation.errors.country
                                  }
                                >
                                  <option value="" label="Select country" />
                                  {countryList.map((country, i) => {
                                    return (
                                      <option key={i} value={country?.name}>
                                        {country?.name}
                                      </option>
                                    );
                                  })}
                                </Input>
                                <FormFeedback type="invalid">
                                  {validation.errors.country}
                                </FormFeedback>
                              </div>
                              {/* Time Group Selection */}
                              <div className="mb-3 col-md-6">
                                <Label className="form-label">Choose Time Group</Label>
                                <Input
                                  name="timeGroupId"
                                  type="select"
                                  placeholder="Time Group"
                                  onChange={validation.handleChange}
                                  onBlur={validation.handleBlur}
                                  value={validation.values.timeGroupId || ''}
                                  invalid={validation.touched.timeGroupId && validation.errors.timeGroupId}
                                >
                                  <option value="">--Choose--</option>
                                  {timeGroup.map((t, i) => (
                                    <option key={i} value={Number(t.id)}>
                                      {t.title}
                                    </option>
                                  ))}
                                </Input>
                                {validation.touched.timeGroupId && validation.errors.timeGroupId && (
                                  <FormFeedback type="invalid">
                                    {validation.errors.timeGroupId}
                                  </FormFeedback>
                                )}
                              </div>

                              {/* Time Slots with Kid Inputs */}
                              {timeGroups.length > 0 && (
                                <div className="mt-4">
                                  <Label className="form-label ">Specify Number of Kids for Each Time Slot</Label>
                                  <div className="space-y-2">
                                    {timeGroups.map((timeSlotGroup, index) => (
                                      <div key={index} className="flex items-center gap-4">
                                        <div className="flex-1">
                                          {formatTimeSlotGroup(timeSlotGroup)}
                                        </div>
                                        <Input
                                          type="number"
                                          min="0"
                                          value={kidInputs[index]}
                                          onChange={(e) => handleKidInputChange(index, e.target.value)}
                                          className="w-24"
                                          placeholder="Kids"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </Row>
                            <h5 className="my-4">Head of Promo Info </h5>
                            <div className="row">
                              <div className="col-md-6">
                                <div className="mb-3">
                                  <Label className="form-label">First Name*</Label>
                                  <Input
                                    name="firstName"
                                    type="text"
                                    placeholder="Enter first name"
                                    onChange={validation.handleChange}
                                    onBlur={validation.handleBlur}
                                    value={validation.values.firstName || firstName}
                                    invalid={
                                      validation.touched.firstName &&
                                      validation.errors.firstName
                                    }
                                  />
                                  <FormFeedback type="invalid">
                                    {validation.errors.firstName}
                                  </FormFeedback>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="mb-3">
                                  <Label className="form-label">Last Name*</Label>
                                  <Input
                                    name="lastName"
                                    type="text"
                                    placeholder="lastName"
                                    onChange={validation.handleChange}
                                    onBlur={validation.handleBlur}
                                    value={validation.values.lastName || lastName}
                                    invalid={
                                      validation.touched.lastName &&
                                      validation.errors.lastName
                                    }
                                  />
                                  <FormFeedback type="invalid">
                                    {validation.errors.lastName}
                                  </FormFeedback>
                                </div>
                              </div>
                            </div>
                            <div className="mb-3">
                              <Label className="form-label">Email Address</Label>
                              <Input
                                name="email"
                                type="email"
                                disabled={isEdit ? true : false}
                                placeholder="Enter email address"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.email || email}
                                invalid={
                                  validation.touched.email &&
                                  validation.errors.email
                                }
                              />
                              <FormFeedback type="invalid">
                                {validation.errors.email}
                              </FormFeedback>
                            </div>
                            <div className="mb-3">
                              <Label className="form-label">Phone Number</Label>
                              <Input
                                name="phone"
                                type="text"
                                placeholder="Enter phone number"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.phone || phone}
                                invalid={
                                  validation.touched.phone &&
                                  validation.errors.phone
                                }
                              />
                              <FormFeedback type="invalid">
                                {validation.errors.phone}
                              </FormFeedback>
                            </div>
                          </Col>
                        </Row>

                        <div className="my-3">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-lg font-medium">Additional Information Fields</h5>
                            <button
                              type="button"
                              onClick={addField}
                              className="flex items-center gap-3 btn btn-primary"
                            >
                              <FeatherIcon
                                icon="plus"
                              />
                              <span className="mx-3">Add Field</span>
                            </button>
                          </div>

                          <div className="space-y-4">
                            {fields.map((field) => (
                              <div key={field.id} className="flex gap-4 mb-3 items-start p-4 border rounded bg-gray-50">
                                <div className="flex-1">
                                  <div className="mb-3">
                                    <Input
                                      type="text"
                                      placeholder="Field Label"
                                      value={field.label}
                                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                                    />
                                  </div>

                                  <div className="flex gap-4">
                                    <Input
                                      value={field.type}
                                      type="select"
                                      onChange={(e) => updateField(field.id, { type: e.target.value })}
                                      className="mb-3"
                                    >
                                      <option value="text">Text</option>
                                      <option value="number">Number</option>
                                      <option value="email">Email</option>
                                      {/* <option value="tel">Phone</option>
                                      <option value="date">Date</option>
                                      <option value="file">File Upload</option> */}
                                    </Input>
                                  </div>
                                  <div className="d-flex align-items-center  justify-content-between ">
                                    <div className="form-check form-switch ">
                                      <input
                                        className="form-check-input"
                                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                        type="checkbox"
                                        id="flexSwitchCheckReverse" />
                                      <label className="form-check-label" htmlFor="flexSwitchCheckReverse">Required</label>
                                    </div>
                                    <span
                                      type="button"
                                      onClick={() => removeField(field.id)}
                                      className="p-2 text-red-500 hover:text-red-700 text-danger o"
                                    >
                                      <FeatherIcon
                                        icon="trash-2"
                                      />
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {fields.length === 0 && (
                            <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded">
                              No additional fields added yet. Click "Add Field" to create custom fields.
                            </div>
                          )}
                        </div>
                        <Row>
                          <Col>
                            <div className="text-end">
                              <button
                                type="submit"
                                className="btn btn-primary save-user"
                              >
                                {isEdit ? "Update" : "Create"}
                              </button>
                            </div>
                          </Col>
                        </Row>
                      </Form>
                    </ModalBody>
                  </Modal>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </div >
      <ToastContainer />
    </React.Fragment >
  );
};

export default withAuth(ManagePromo);
