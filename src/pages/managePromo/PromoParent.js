import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DeleteModal from "../../components/Common/DeleteModal";
import * as Yup from "yup";
import { useFormik } from "formik";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import axios from "axios";
import withAuth from "../withAuth";
import { baseUrl } from "../../Network";
import { Col, Container, Form, Input, Label, Modal, ModalBody, ModalHeader, Row, } from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    BtnBold,
    BtnItalic,
    Editor,
    EditorProvider,
    Toolbar,
    BtnLink,
    BtnBulletList,
    BtnClearFormatting,
    BtnNumberedList,
    BtnStyles,
    BtnUndo,
    BtnRedo,
    BtnStrikeThrough,
    BtnUnderline
} from "react-simple-wysiwyg";
import UploadWidget from "../../Uploader";

const ManageParent = () => {
    const [usersRaw, setUsersRaw] = useState([]);
    const [usersRawF, setUsersRawF] = useState([]);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [contact, setContact] = useState({});
    const [modal, setModal] = useState(false);
    const [modalSingle, setModalSingle] = useState(false);
    const [reminderModal, setReminderModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [country, setCountry] = useState({});
    const [state, setState] = useState({});
    const [timezone, setTimezone] = useState({});
    const [privateParentOnly, setPrivateParentOnly] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [groupEmailData, SetGroupEmailData] = useState({ t: 0, s: "", b: "" });
    const [url, updateUrl] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeachers] = useState("")
    const [link, setLink] = useState("")

    useEffect(() => {
        document.title = "Promo Parents | RYD Admin";
        fetchUsers().then(null);
    }, [modal]);

    const { id } = useParams()

    function handleOnUpload(error, result, widget) {
        if (error) {
            updateError(error);
            widget.close({
                quiet: true
            });
            return;
        }
        updateUrl(result?.info?.secure_url);
    }

    const handleTeacherChange = (e) => {
        setSelectedTeacher(e.target.value);
    };

    useEffect(() => {
        fetchTeachers().then(r => null)
    }, []);

    const fetchTeachers = async () => {
        try {
            const response = await axios.get(`${baseUrl}/admin/teacher/all`);
            setTeachers(response.data.data);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${baseUrl}/admin/promo/parents/${id}`);
            setUsersRaw(response.data.data);
            setUsers(response.data.data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("Error:", error);
        }
    };

    const toggle = () => {
        setModal(!modal);
    };

    const toggleSingle = () => {
        setModalSingle(!modalSingle);
    };

    const toggleReminder = () => {
        setReminderModal(!reminderModal);
    };

    const handleUserClick = (userData) => {
        setContact(userData);
        setIsEdit(true);
        toggle();
    };

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            subject: "",
            message: "",
        },
        validationSchema: Yup.object({
            subject: Yup.string().required("Please enter the subject"),
            message: Yup.string().required("Please enter the message"),
        }),
    });

    const handleSendEmailAll = async (event) => {
        event.preventDefault();
        try {
            await axios.post(`${baseUrl}/admin/promo/parent/send/all/${id}`, groupEmailData);
            toast.success("Email sent to all parents successfully");
            toggle();
        } catch (error) {
            toast.error("Failed to send email to parents");
        }
    };

    const handleSendEmailSingle = async (event) => {
        event.preventDefault();
        try {
            await axios.post(`${baseUrl}/admin/promo/parent/send/${selectedUserId}`, {
                body: validation.values.message,
                subject: validation.values.subject,
                attachmentLink: url
            });
            toast.success("Email sent to the parent successfully");
            toggleSingle();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to send email to the parent");
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSingleSendEmail = (userId) => {
        setSelectedUserId(userId);
        toggleSingle();
    };


    const onClickDelete = (userData) => {
        setContact(userData);
        setDeleteModal(true);
    };

    const onClickResetPassword = async (userData) => {
        //set new password for parent
        let _newPass = prompt("Enter new password for " + userData?.firstName + " " + userData?.lastName + ". Warning: This action cannot be undo");
        if (_newPass) {
            //reset parent password
            await axios.post(`${baseUrl}/admin/promo/parent/reset-password/${userData.id}`, {
                newPassword: _newPass,
            });
            //parent password altered
            toast.success("Parent password altered !")
        }
    };

    // const handleDeleteUser = async () => {
    //     try {
    //         await axios.delete(`${baseUrl}/admin/parent/${contact.id}`);
    //         const updatedUsers = users.filter((user) => user.id !== contact.id);
    //         setUsers(updatedUsers);
    //         setDeleteModal(false);
    //         toast.success("Parent deleted successfully");
    //     } catch (error) {
    //         console.error("Error:", error);
    //         toast.error("Failed to delete parent");
    //     }
    // };

    //filter mode
    const performFilter = (n) => {
        if (n === 2) {
            const __filter = [...usersRawF].filter((x => x.privacyMode === false))
            setUsers(__filter)
        }
        if (n === 1) {
            const __filter = [...usersRawF].filter((x => x.privacyMode === true))
            setUsers(__filter)
        }
        if (n === 0) {
            window.location.reload()
        }
    }

    const groupEmail = (t, e) => {
        SetGroupEmailData({ ...groupEmailData, [t]: e.target.value })
    }

    //resolve all child names for parents
    const getAllChildName = (pData) => {
        if (pData?.children?.length > 0) {
            //fetch child name
            return pData.children.map(((child) => ({
                childNames: `${child?.firstName} ${child?.lastName}`,
                isActive: child.programs.filter(y => y.isPaid && !y.isCompleted).length
            })))
        } else {
            return null
        }
    }

    return (
        <React.Fragment>
            {/* <DeleteModal
                show={deleteModal}
                onDeleteClick={handleDeleteUser}
                onCloseClick={() => setDeleteModal(false)}
            /> */}
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Dashboard" breadcrumbItem="Manage Parent" />
                    <Row>
                        <Col lg="12">
                            <Row className="align-items-center">
                                <Col md={4}>
                                    <div className="mb-3">
                                        <h5 className="card-title">
                                            Promo Parent List{" "}
                                            <span className="text-muted fw-normal ms-2">
                                                ({users.length})
                                            </span>
                                        </h5>
                                    </div>
                                </Col>

                                <Col md={8}>
                                    <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 mb-3">
                                        <div style={{ width: 200 }}>
                                            <select className={'form-control'} onChange={(e) => {
                                                //search for parent with cohort
                                                if (Number(e.target.value) === 0) {
                                                    window.location.reload()
                                                }
                                                if (Number(e.target.value) === 1) {
                                                    const __filter = usersRaw.filter((x) => x?.children.filter((y) => y?.programs.filter((z) => z.isPaid && !z.isCompleted).length > 0).length > 0)
                                                    setUsersRawF(__filter)
                                                    setUsers(__filter)
                                                }
                                                if (Number(e.target.value) === 2) {
                                                    const __filter = usersRaw.filter((x) => x?.children.filter((y) => y?.programs.filter((z) => !z.isPaid).length > 0).length > 0)
                                                    setUsersRawF(__filter)
                                                    setUsers(__filter)
                                                }
                                                if (Number(e.target.value) === 3) {
                                                    const __filter = usersRaw.filter((x) => x?.children.filter((y) => y?.programs.filter((z) => z.isPaid && z.isCompleted).length > 0).length > 0)
                                                    setUsersRawF(__filter)
                                                    setUsers(__filter)
                                                }
                                                if (Number(e.target.value) === 4) {
                                                    const __filter = usersRaw.filter((x) => x?.children.filter((y) => y?.programs.filter((z) => !z.isPaid).length === 0).length === 0)
                                                    setUsersRawF(__filter)
                                                    setUsers(__filter)
                                                }
                                            }}>
                                                <option value={0}>All Parents</option>
                                                <option value={1}>With Active Cohort</option>
                                                <option value={2}>With No Active Cohort</option>
                                                <option value={3}>All Alumni</option>
                                            </select>
                                        </div>
                                        <div style={{ width: 200, display: 'none' }}>
                                            <select className={'form-control'} onChange={(e) => {
                                                //switch mode
                                                setPrivateParentOnly(Number(e.target.value))
                                                performFilter(Number(e.target.value))
                                            }}>
                                                <option value={0}>All Parent Mode</option>
                                                <option value={1}>Private Data</option>
                                                <option value={2}>Public Data</option>
                                            </select>
                                        </div>
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
                                                type="button"
                                                className="btn btn-light"
                                                onClick={() => toggle()}>
                                                <i className="mdi mdi-email-variant"></i> Message All
                                                Parents
                                            </button>
                                        </div>
                                    </div>
                                </Col>
                                <p>
                                    Privacy
                                    Mode: {privateParentOnly === 0 ? "All Mode" : privateParentOnly === 1 ? "Private" : "Public"}
                                </p>
                            </Row>
                            <Row>
                                <Col xl="12">
                                    {loading ? (
                                        <div className="text-center mt-5">
                                            <div
                                                className="spinner-border text-primary"
                                                role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    ) : users.length === 0 ? (
                                        <div className="text-center mt-5">
                                            <h3>No data available</h3>
                                        </div>
                                    ) : (
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Parent Name</th>
                                                    <th>Children Name(s)</th>
                                                    <th>Email</th>
                                                    <th>Phone</th>
                                                    <th>State</th>
                                                    <th>Survey</th>
                                                    <th>Country</th>
                                                    <th>Timezone</th>
                                                    <th>No.Child</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Array.isArray(users) &&
                                                    users
                                                        .filter((user) =>
                                                            `${user.firstName} ${user.lastName}`
                                                                .toLowerCase()
                                                                .includes(searchQuery.toLowerCase())
                                                        )
                                                        .map((user, index) => (
                                                            <tr key={index}
                                                                style={{ backgroundColor: user?.privacyMode ? '#ffeff2' : '#fff' }}>
                                                                <td>{index + 1}</td>
                                                                <td>{user.firstName} {user.lastName}</td>
                                                                <td style={{ width: 200 }}>
                                                                    <div
                                                                        style={{ whiteSpace: 'nowrap' }}>{(user?.children?.length > 0 && getAllChildName(user).map((x, i) =>
                                                                            <li style={{ fontWeight: !x.isActive ? 'normal' : 'bold' }}
                                                                                key={i}>{x.childNames}</li>)) ||
                                                                            <li>No Child</li>}</div>
                                                                </td>
                                                                <td>{user.email}</td>
                                                                <td>{user.phone}</td>
                                                                <td style={{ width: 20 }}>{user.state}</td>
                                                                <td>{user.survey}</td>
                                                                <td>{user.country}</td>
                                                                <td>{user.timezone}</td>
                                                                <td>{user?.children?.length}</td>
                                                                <td>
                                                                    <div className="d-flex gap-3">
                                                                        <Link
                                                                            className="text-primary"
                                                                            to="#"
                                                                            onClick={() =>
                                                                                handleSingleSendEmail(user.id)
                                                                            }>
                                                                            <i className="mdi mdi-email-variant font-size-18"></i>
                                                                        </Link>
                                                                        {/*<Link*/}
                                                                        {/*    className="text-success"*/}
                                                                        {/*    to="#"*/}
                                                                        {/*    onClick={() => {*/}
                                                                        {/*        handleUserClick(user);*/}
                                                                        {/*        setIsEdit(true);*/}
                                                                        {/*    }}>*/}
                                                                        {/*    <i className="mdi mdi-pencil font-size-18"></i>*/}
                                                                        {/*</Link>*/}
                                                                        {/* <Link
                                                                        className="text-danger d-none"
                                                                        to="#"
                                                                        onClick={() => onClickDelete(user)}>
                                                                        <i className="mdi mdi-delete font-size-18"></i>
                                                                    </Link> */}
                                                                        <Link
                                                                            className="text-danger"
                                                                            to="#"
                                                                            onClick={() => onClickResetPassword(user)}>
                                                                            <i className="mdi mdi-key font-size-18"></i>
                                                                        </Link>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                            </tbody>
                                        </table>
                                    )}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </div>
            <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader toggle={toggle}>Compose Email</ModalHeader>
                <ModalBody>
                    <Form onSubmit={validation.handleSubmit}>
                        <Row>
                            <Col xs={12}>
                                <div className={'mb-3'}>
                                    <Label className="form-label">Email Target</Label>
                                    <select value={groupEmailData.t} className={'form-control'}
                                        onChange={(e) => groupEmail("t", e)}>
                                        <option value={0}>With All Cohort Status</option>
                                        <option value={1}>With Active Cohort</option>
                                        <option value={2}>With No Active Cohort</option>
                                        <option value={3}>With Idle Cohort</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <Label className="form-label">Email Subject</Label>
                                    <Input
                                        name="subject"
                                        type="text"
                                        placeholder="Subject"
                                        onChange={(e) => groupEmail("s", e)}
                                        value={groupEmailData.s}
                                    />
                                </div>
                                <div className="mb-3">
                                    <Label className="form-label">Email Body</Label>
                                    <EditorProvider>
                                        <Editor value={groupEmailData.b} onChange={(e) => groupEmail("b", e)}
                                            containerProps={{ style: { resize: 'vertical', height: 200 } }}>
                                            <Toolbar>
                                                <BtnBold />
                                                <BtnItalic />
                                                <BtnLink />
                                                <BtnBulletList />
                                                <BtnClearFormatting />
                                                <BtnNumberedList />
                                                <BtnStyles />
                                                <BtnUndo />
                                                <BtnRedo />
                                                <BtnStrikeThrough />
                                                <BtnUnderline />
                                            </Toolbar>
                                        </Editor>
                                    </EditorProvider>
                                    <UploadWidget onUpload={handleOnUpload}>
                                        {({ open }) => {
                                            function handleOnClick(e) {
                                                e.preventDefault();
                                                open();
                                            }

                                            return (
                                                <a style={{ marginTop: 5 }} href={'#'} onClick={handleOnClick}>
                                                    {(url) ? "Override attachment" : "Add attachment"}
                                                </a>
                                            )
                                        }}
                                    </UploadWidget>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <div className="text-end">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={toggle}>
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="ms-2 btn btn-primary ml-2"
                                        onClick={handleSendEmailAll}>
                                        Send Email
                                    </button>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </ModalBody>
            </Modal>

            <Modal isOpen={modalSingle} toggle={toggleSingle}>
                <ModalHeader toggle={toggleSingle}>Compose Email</ModalHeader>
                <ModalBody>
                    <Form onSubmit={validation.handleSubmit}>
                        <Row>
                            <Col xs={12}>
                                <div className="mb-3">
                                    <Label className="form-label">Email Subject</Label>
                                    <Input
                                        name="subject"
                                        type="text"
                                        placeholder="Subject"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.subject}
                                    />
                                </div>
                                <div className="mb-3">
                                    <Label className="form-label">Email Body</Label>
                                    <EditorProvider>
                                        <Editor name="message" onChange={validation.handleChange}
                                            value={validation.values.message}
                                            containerProps={{ style: { resize: 'vertical', height: 200 } }}>
                                            <Toolbar>
                                                <BtnBold />
                                                <BtnItalic />
                                                <BtnLink />
                                                <BtnBulletList />
                                                <BtnClearFormatting />
                                                <BtnNumberedList />
                                                <BtnStyles />
                                                <BtnUndo />
                                                <BtnRedo />
                                                <BtnStrikeThrough />
                                                <BtnUnderline />
                                            </Toolbar>
                                        </Editor>
                                    </EditorProvider>
                                    <UploadWidget onUpload={handleOnUpload}>
                                        {({ open }) => {
                                            function handleOnClick(e) {
                                                e.preventDefault();
                                                open();
                                            }

                                            return (
                                                <a style={{ marginTop: 5 }} href={'#'} onClick={handleOnClick}>
                                                    {(url) ? "Override attachment" : "Add attachment"}
                                                </a>
                                            )
                                        }}
                                    </UploadWidget>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <div className="text-end">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={toggleSingle}>
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="ms-2 btn btn-primary ml-2"
                                        onClick={handleSendEmailSingle}>
                                        Send Email
                                    </button>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </ModalBody>
            </Modal>
            <ToastContainer />
        </React.Fragment>
    );
};
export default withAuth(ManageParent);
