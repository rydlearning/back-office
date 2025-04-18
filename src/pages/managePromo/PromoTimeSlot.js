import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DeleteModal from "../../components/Common/DeleteModal";
import * as Yup from "yup";
import { useFormik } from "formik";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";
import CustomTimezoneSelect from "../CustomTimezoneSelect";
import withAuth from "../withAuth";
import axios from "axios";
import {
    Col,
    Container,
    Row,
    Modal,
    ModalHeader,
    ModalBody,
    Form,
    Label,
    Input,
    FormFeedback,
} from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseUrl } from '../../Network';
import { formatData } from "../../utils";

const ManageTimeSlot = () => {
    document.title = "Manage Promo Child | RYD Admin";

    const [users, setUsers] = useState([]);
    const [usersData, setUsersData] = useState([]);
    const [timeSlotData, setTimeSlotData] = useState([]);
    const [contact, setContact] = useState({});
    const [modal, setModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [timeGroup, setTimeGroup] = useState([]);
    const [slot, setSlot] = useState();
    const [slotIndex, setSlotIndex] = useState();
    const [filterData, setFilterData] = useState([]);
    const [title, setTitle] = useState("");
    const [formattedData, setFormattedData] = useState([]);

    useEffect(() => {
        fetchImeSlot()
    }, []);

    const { id } = useParams()

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            numberOfKids: slot || "",
        },
        validationSchema: Yup.object({
            numberOfKids: Yup.number().required("Please enter new slot"),
        }),

        onSubmit: async (values) => {
            try {
                const slotData = {
                    numberOfKids: values.numberOfKids,
                    index:slotIndex
                };

                const response = await axios.put(
                    `${baseUrl}/admin/promo/timeslot/edit/${id}`,
                    slotData
                );

                if (!response.status) {
                    toast.error(`Try again later`);
                    return
                }

                toast.success("Child updated successfully");
                setTimeout(() => {
                    fetchImeSlot()
                }, 2000);

                toggle();
            } catch (error) {
                console.error(error);
            }
        },
    });

    useEffect(() => {
        if (timeGroup.times) {
            try {
                const parsedTimeSlots = timeGroup.times;
                let formatted = [];
                if (Array.isArray(parsedTimeSlots[0]) && Array.isArray(parsedTimeSlots)) {
                    formatted = parsedTimeSlots.map((slotPair, index) => {
                        const [start, end] = slotPair;
                        return {
                            value: index,
                            name: `${start.dayText} ${start.timeText}, ${end.dayText} ${end.timeText}`,
                        };
                    });
                }

                else if (Array.isArray(parsedTimeSlots)) {
                    formatted = parsedTimeSlots.map((slot) => ({
                        value: slot.id,
                        name: `${slot.dayText} ${slot.timeText}`,
                    }));
                }

                setFormattedData(formatted);
                setFilterData(formatted)
            } catch (error) {
                console.error('Error parsing time slots:', error);
                setFormattedData([]);
            }
        }
    }, [timeGroup]);

    const getNumberOfKidsByIndex = (index) => {
        const parsedSlots = formatData(timeSlotData.slot);
        const slotConfig = parsedSlots.find(config => config.index === index);
        return slotConfig ? slotConfig.numberOfKid : 0;
    };
    
    const getFilteredValue = (key) => {
        if (timeSlotData.slotChilds.hasOwnProperty(key)) {
            return timeSlotData.slotChilds[key];
        }
        return null;
    };

    const fetchImeSlot = async () => {
        try {
            const response = await axios.get(`${baseUrl}/admin/promo/timeslot/all/${id}`);
            const data = response.data.data
            setTimeGroup(data.timeTable);
            setTitle(data.timeTable.title)
            setTimeSlotData(data)
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error(error);
        }
    };


    const toggle = () => {
        setModal(!modal);
    };

    const handleEditClick = (value, numberOfKids) => {
        setSlot(numberOfKids);
        setSlotIndex(value);
        setIsEdit(true);
        toggle();
    };

    function filterTableData(data, searchQuery) {
        return data.filter((slot) => {
          const searchText = searchQuery.toLowerCase();
          return (
            slot.name.toLowerCase().includes(searchText)
          );
        });
      }
    
      useEffect(() => {
        if (searchQuery) {
          setFilterData(filterTableData(formattedData, searchQuery));
        } else {
          setFilterData(formattedData);
        }
      }, [searchQuery]);


    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Dashboard" breadcrumbItem="Manage Time Slot" />
                    <Row className="align-items-center">
                        <Col md={6}>
                            <div className="mb-3">
                                <h5 className="card-title">
                                    {title}
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
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg="12">
                            <Row>
                                <Col xl="12">
                                    {loading ? (
                                        <div className="text-center mt-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    ) : filterData.length === 0 ? (
                                        <div className="text-center mt-5">
                                            <h3>No data available</h3>
                                        </div>
                                    ) : (
                                        <table className="table align-middle">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Time Group</th>
                                                    <th>Slot</th>
                                                    <th>Taken Slot</th>
                                                    <th>Available Slot</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filterData.map((time, index) => (
                                                    <tr key={index} style={{ backgroundColor: '#ffeff2' }}>
                                                        <td>{index + 1}</td>
                                                        <td>{time?.name}</td>
                                                        <td>{getNumberOfKidsByIndex(time.value)}</td>
                                                        <td>{getFilteredValue(time.value)  !== null ? getFilteredValue(time.value) : 0 }</td>
                                                        <td>{getFilteredValue(index) !== null ? getNumberOfKidsByIndex(time.value) - getFilteredValue(time.value) : getNumberOfKidsByIndex(time.value)}</td>
                                                        <td>
                                                            <div className="d-flex gap-3">
                                                                <Link
                                                                    className="text-success"
                                                                    to="#"
                                                                    onClick={() => {
                                                                        handleEditClick(time.value, getNumberOfKidsByIndex(time.value));
                                                                    }}
                                                                >
                                                                    <i className="mdi mdi-pencil font-size-18"></i>
                                                                </Link>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                    <Modal isOpen={modal} toggle={toggle}>
                                        <ModalHeader toggle={toggle}>
                                            Edit Slot
                                        </ModalHeader>
                                        <ModalBody>
                                            <Form onSubmit={validation.handleSubmit}>
                                                <Row>
                                                    <Col xs={12}>
                                                        <div className="mb-3">
                                                            <Label className="form-label">Slot</Label>
                                                            <Input
                                                                name="numberOfKids"
                                                                type="text"
                                                                placeholder="Number of kids"
                                                                onChange={validation.handleChange}
                                                                onBlur={validation.handleBlur}
                                                                value={validation.values.numberOfKids || ""}
                                                                invalid={
                                                                    validation.touched.numberOfKids &&
                                                                    validation.errors.numberOfKids
                                                                }
                                                            />
                                                            <FormFeedback type="invalid">
                                                                {validation.errors.numberOfKids}
                                                            </FormFeedback>
                                                        </div>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <div className="text-end">
                                                            <button
                                                                type="submit"
                                                                className="btn btn-primary save-user"
                                                            >
                                                                Update Slot
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
            </div>
            <ToastContainer />
        </React.Fragment>
    );
};

export default withAuth(ManageTimeSlot);
