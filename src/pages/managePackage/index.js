import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import DeleteModal from "../../components/Common/DeleteModal";
import * as Yup from "yup";
import {useFormik} from "formik";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import axios from "axios";
import {baseUrl} from '../../Network';
import withAuth from "../withAuth";
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
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManagePackage = () => {
    document.title = "Manage Package | RYD Admin";

    const [packages, setPackages] = useState([]);
    const [timeGroup, setTimeGroup] = useState([]);
    const [subPackages, setSubPackages] = useState([]);
    const [packagesInput, setPackagesInput] = useState({});
    const [packageData, setPackageData] = useState({});
    const [modal, setModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [bannerUrl, setBannerUrl] = useState("");

    useEffect(() => {
        fetchPackages();
    }, [modal]);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseUrl}/admin/package/all`);
            //load time group
            const responseTG = await axios.get(`${baseUrl}/admin/timegroup/all`);

            setPackages(response.data.data);
            setTimeGroup(responseTG.data.data);
            setLoading(false);
        } catch (error) {
            console.error("Error:", error);
            setLoading(false);
        }
    };

    const toggle = () => {
        setModal(!modal);
    };

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            title: packageData.title || "",
            name: packageData.name || "",
            description: packageData.description || "",
            timeGroupId: packageData.timeGroupId || "",
            level: packageData.level || "",
            imageUrl: packageData.imageUrl || "",
            weekDuration: packageData.weekDuration || "",
            amount: packageData.amount || "",
            altAmount: packageData.altAmount || "",
            minAge: packageData.minAge || "",
            maxAge: packageData.maxAge || "",
        },
        validationSchema: Yup.object({
            title: Yup.string().required("Please enter the Title"),
            name: Yup.string().required("Please enter the Name"),
            description: Yup.string().required("Please enter a description"),
            timeGroupId: Yup.number().optional(),
            level: Yup.number().required("Please enter a level"),
            imageUrl: Yup.string().required("Please enter an image URL"),
            weekDuration: Yup.number().required("Please enter the program duration number of weeks"),
            amount: Yup.number().required("Please enter the amount"),
            altAmount: Yup.number().required("Please enter the alternative amount"),
            minAge: Yup.number().required("Please enter the minimum age"),
            maxAge: Yup.number().required("Please enter the maximum age"),
        }),
        onSubmit: async (values) => {
            try {
                const newPackage = {
                    title: values.title,
                    name: values.name,
                    description: values.description,
                    timeGroupId: Number(values.timeGroupId),
                    subClass: subPackages,
                    level: values.level,
                    imageUrl: values.imageUrl,
                    weekDuration: values.weekDuration,
                    amount: values.amount,
                    altAmount: values.altAmount,
                    minAge: values.minAge,
                    maxAge: values.maxAge,
                };

                let response;
                if (isEdit) {
                    response = await axios.put(
                        `${baseUrl}/admin/package/edit/${packageData.id}`,
                        newPackage
                    );
                    toast.success("Package updated successfully");
                } else {
                    response = await axios.post(
                        `${baseUrl}/admin/package/create`,
                        newPackage
                    );
                    toast.success("Package created successfully");
                }

                const responseData = response.data;

                if (isEdit) {
                    const updatedPackages = packages.map((pkg) =>
                        pkg.id === packageData.id ? {...pkg, ...responseData} : pkg
                    );
                    setPackages(updatedPackages);
                } else {
                    setPackages([...packages, responseData]);
                }
                toggle();
            } catch (error) {
                console.error("Error:", error);
            }
        },
    });

    const handlePackageClick = (pkg) => {
        setPackageData(pkg);
        setSubPackages(pkg.subClass)
        setPackagesInput({})
        setIsEdit(true);
        toggle();
    };

    const onClickDelete = (pkg) => {
        setPackageData(pkg);
        setDeleteModal(true);
    };

    const handleDeletePackage = async () => {
        try {
            await axios.delete(`${baseUrl}/admin/package/${packageData.id}`);
            const updatedPackages = packages.filter(
                (pkg) => pkg.id !== packageData.id
            );
            setPackages(updatedPackages);
            setDeleteModal(false);
            toast.success("Package deleted successfully");
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to delete package");
        }
    };

    // Function to filter package list based on search query
    const filteredPackages = packages.filter((pkg) =>
        pkg.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    //subclass
    const addSubClassItems = () => {
        if (packagesInput?.title && packagesInput?.cad && packagesInput?.ngn) {
            //inset
            setSubPackages([...subPackages, packagesInput])
            setPackagesInput({})
        } else {
            toast.warn("Cannot put an empty sub packages")
        }
    }
    const removeSubPackage = (i) => {
        if (confirm("Are you sure to remove this items")) {
            if (i > -1) {
                //remove and set
                const obj = subPackages[i]
                setSubPackages(subPackages.filter(o => o !== obj))
            } else {
                toast.warn("Cannot remove an empty sub packages")
            }
        }
    }

    return (
        <React.Fragment>
            <DeleteModal
                show={deleteModal}
                onDeleteClick={handleDeletePackage}
                onCloseClick={() => setDeleteModal(false)}
            />
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Dashboard" breadcrumbItem="Manage Package"/>
                    <Row>
                        <Col md={6}>
                            <div className="mb-3">
                                <h5 className="card-title">
                                    Package List{" "}
                                    <span className="text-muted fw-normal ms-2">
                    ({packages.length})
                  </span>
                                </h5>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 mb-3">
                                <div>
                                    <Link
                                        to="#"
                                        className="btn btn-light"
                                        onClick={() => {
                                            setPackageData({});
                                            setSubPackages([])
                                            setIsEdit(false);
                                            toggle();
                                        }}>
                                        <i className="bx bx-plus me-1"></i> Add New Package
                                    </Link>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col xl="12" className={'divTable'}>
                            {loading ? (
                                <div className="text-center mt-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : filteredPackages.length === 0 ? (
                                <div className="text-center mt-5">
                                    <h3>No data available</h3>
                                </div>
                            ) : (
                                <table className="table align-middle">
                                    <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Title</th>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Level</th>
                                        <th>SubClass</th>
                                        <th>Weeks</th>
                                        <th>Amount</th>
                                        <th>Alt.Amount</th>
                                        <th>Age Range</th>
                                        <th>Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredPackages.map((pkg, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{pkg.title}</td>
                                            <td>{pkg.name}</td>
                                            <td>{pkg.description}</td>
                                            <td>{pkg.level}</td>
                                            <td>{pkg?.subClass?.length || 0}</td>
                                            <td>{pkg?.weekDuration}</td>
                                            <td>{pkg?.amount}</td>
                                            <td>{pkg?.altAmount}</td>
                                            <td>{pkg?.minAge} - {pkg?.maxAge}</td>
                                            <td>
                                                <div className="d-flex gap-3">
                                                    <Link
                                                        title={"Update Package"}
                                                        className="text-success"
                                                        to="#"
                                                        onClick={() => handlePackageClick(pkg)}>
                                                        <i className="bx bx-edit font-size-18"></i>
                                                    </Link>
                                                    <Link
                                                        title={"Delete package if not in use."}
                                                        className="text-danger"
                                                        to="#"
                                                        onClick={() => onClickDelete(pkg)}>
                                                        <i className="bx bx-trash font-size-18"></i>
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
                                    {isEdit ? "Edit Package" : "Add New Package"}
                                </ModalHeader>
                                <ModalBody>
                                    <Form onSubmit={validation.handleSubmit}>
                                        <Row>
                                            <Col xs={12}>
                                                <div className="mb-3">
                                                    <Label className="form-label">Program Title</Label>
                                                    <Input
                                                        name="title"
                                                        type="text"
                                                        placeholder="Title"
                                                        onChange={validation.handleChange}
                                                        onBlur={validation.handleBlur}
                                                        value={validation.values.title || ""}
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
                                                    <Label className="form-label">Program Name</Label>
                                                    <Input
                                                        name="name"
                                                        type="text"
                                                        placeholder="Title"
                                                        onChange={validation.handleChange}
                                                        onBlur={validation.handleBlur}
                                                        value={validation.values.name || ""}
                                                        invalid={
                                                            validation.touched.name &&
                                                            validation.errors.name
                                                        }
                                                    />
                                                    <FormFeedback type="invalid">
                                                        {validation.errors.name}
                                                    </FormFeedback>
                                                </div>

                                                <Row>
                                                    <div className="mb-3 col-md-6">
                                                        <Label className="form-label">Program Description</Label>
                                                        <Input
                                                            name="description"
                                                            type="text"
                                                            placeholder="Description"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.description || ""}
                                                            invalid={
                                                                validation.touched.description &&
                                                                validation.errors.description
                                                            }
                                                        />
                                                        <FormFeedback type="invalid">
                                                            {validation.errors.description}
                                                        </FormFeedback>
                                                    </div>
                                                    <div className="mb-3 col-md-6">
                                                        <Label className="form-label">Choose Time Group</Label>
                                                        <Input
                                                            name="timeGroupId"
                                                            type="select"
                                                            placeholder="Time Group"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.timeGroupId || null}
                                                            invalid={
                                                                validation.touched.timeGroupId &&
                                                                validation.errors.timeGroupId
                                                            }>
                                                            <option value={null}>--Choose--</option>
                                                            {timeGroup.map((t, i) => <option key={i}
                                                                                             value={Number(t.id)}>{t.title}</option>)}
                                                        </Input>
                                                        <FormFeedback type="invalid">
                                                            {validation.errors.timeGroupId}
                                                        </FormFeedback>
                                                    </div>
                                                </Row>

                                                <Row>
                                                    <div className="col-md-6 mb-3">
                                                        <Label>Level</Label>
                                                        <Input
                                                            defaultValue={1}
                                                            type="select"
                                                            name="level"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.level || ""}
                                                            invalid={
                                                                validation.touched.level &&
                                                                validation.errors.level
                                                            }>
                                                            <option value="0">Select Level</option>
                                                            <option selected={true} value={1}>1</option>
                                                            <option value={2}>2</option>
                                                            <option value={3}>3</option>
                                                            <option value={4}>4</option>
                                                            <option value={5}>5</option>
                                                            <option value={6}>6</option>
                                                            <option value={7}>7</option>
                                                            <option value={8}>8</option>
                                                            <option value={9}>9</option>
                                                            <option value={10}>10</option>
                                                            <option value={11}>11</option>
                                                            <option value={12}>12</option>
                                                        </Input>
                                                        <FormFeedback type="invalid">
                                                            {validation.errors.level}
                                                        </FormFeedback>
                                                    </div>

                                                    <div className="col-md-6 mb-3">
                                                        <Label className="form-label">Week Duration </Label>
                                                        <Input
                                                            type="text"
                                                            name="weekDuration"
                                                            placeholder="Number of weeks"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.weekDuration || ""}
                                                            invalid={validation.touched.weekDuration && validation.errors.weekDuration}
                                                        />
                                                        <FormFeedback
                                                            type="invalid">{validation.errors.weekDuration}</FormFeedback>
                                                    </div>
                                                </Row>


                                                <div className="mb-3">
                                                    <Label className="form-label">Banner Image URL </Label>
                                                    <small style={{marginLeft: 20}}><a href={'#'}
                                                                                       onClick={() => setBannerUrl("https://i.im.ge/2024/04/19/Z2k3bq.basic-bg.jpeg")}>Basic
                                                        Banner</a> </small>
                                                    <small style={{marginLeft: 20}}><a href={'#'}
                                                                                       onClick={() => setBannerUrl("https://i.im.ge/2024/04/19/Z2kgA1.advance-bg.jpeg")}>Adv.
                                                        Banner</a> </small>
                                                    <Input
                                                        name="imageUrl"
                                                        type="text"
                                                        placeholder="Image URL"
                                                        onChange={validation.handleChange}
                                                        onBlur={validation.handleBlur}
                                                        value={validation.values.imageUrl || bannerUrl}
                                                        invalid={
                                                            validation.touched.imageUrl &&
                                                            validation.errors.imageUrl
                                                        }
                                                    />
                                                    <FormFeedback type="invalid">
                                                        {validation.errors.imageUrl}
                                                    </FormFeedback>
                                                </div>


                                                <div className="row">

                                                    <div className="col-md-6 mb-3">
                                                        <Label className="form-label">Amount</Label>
                                                        <Input
                                                            name="amount"
                                                            type="number"
                                                            placeholder="CAD"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.amount || ""}
                                                            invalid={validation.touched.amount && validation.errors.amount}
                                                        />
                                                        <FormFeedback
                                                            type="invalid">{validation.errors.amount}</FormFeedback>
                                                    </div>

                                                    <div className="col-md-6 mb-3">
                                                        <Label className="form-label">Alt Amount</Label>
                                                        <Input
                                                            name="altAmount"
                                                            type="number"
                                                            placeholder="NGN"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.altAmount || ""}
                                                            invalid={validation.touched.altAmount && validation.errors.altAmount}
                                                        />
                                                        <FormFeedback
                                                            type="invalid">{validation.errors.altAmount}</FormFeedback>

                                                    </div>
                                                </div>

                                                <div className="row">

                                                    <div className="col-md-6 mb-3">
                                                        <Label className="form-label">Min Age</Label>
                                                        <Input
                                                            name="minAge"
                                                            type="number"
                                                            placeholder="Minimum Age"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.minAge || ""}
                                                            invalid={
                                                                validation.touched.minAge &&
                                                                validation.errors.minAge
                                                            }
                                                        />
                                                        <FormFeedback type="invalid">
                                                            {validation.errors.minAge}
                                                        </FormFeedback>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <Label className="form-label">Max Age</Label>
                                                        <Input
                                                            name="maxAge"
                                                            type="number"
                                                            placeholder="Maximum Age"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.maxAge || ""}
                                                            invalid={
                                                                validation.touched.maxAge &&
                                                                validation.errors.maxAge
                                                            }
                                                        />
                                                        <FormFeedback type="invalid">
                                                            {validation.errors.maxAge}
                                                        </FormFeedback>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>

                                        {isEdit ? <>
                                            <Row>
                                                <Col>
                                                    <div className="col-md-12 mb-3">
                                                        <Label className="form-label">Sub Packages</Label>
                                                        <table style={{width: '100%'}}>
                                                            <tr>
                                                                <td><input value={packagesInput?.title || ""}
                                                                           onChange={e => setPackagesInput({
                                                                               ...packagesInput,
                                                                               title: e.target.value
                                                                           })} placeholder={"Title"}/></td>
                                                                <td><input type={'number'}
                                                                           value={packagesInput?.cad || ""}
                                                                           onChange={e => setPackagesInput({
                                                                               ...packagesInput,
                                                                               cad: e.target.value
                                                                           })} placeholder={"CAD"}/></td>
                                                                <td><input type={'number'}
                                                                           value={packagesInput?.ngn || ""}
                                                                           onChange={e => setPackagesInput({
                                                                               ...packagesInput,
                                                                               ngn: e.target.value
                                                                           })} placeholder={"NGN"}/></td>
                                                                <td>
                                                                    <Link
                                                                        className="text-success"
                                                                        to="#"
                                                                        onClick={
                                                                            (e) => {
                                                                                e.preventDefault()
                                                                                addSubClassItems()
                                                                            }}>
                                                                        <i className="bx bx-book-add font-size-18"></i>
                                                                    </Link>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </div>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col xs={12}>
                                                    <div className="col-md-12 mb-3">
                                                        <table style={{width: '100%'}}>
                                                            <tr>
                                                                <th>Title</th>
                                                                <th>CAD</th>
                                                                <th>NGN</th>
                                                                <th></th>
                                                            </tr>
                                                            {subPackages?.length > 0 && subPackages?.map((s, i) => <>
                                                                <tr>
                                                                    <td>{s.title}</td>
                                                                    <td>{s.cad}</td>
                                                                    <td>{s.ngn}</td>
                                                                    <td><i className="bx bx-x font-size-18"
                                                                           style={{cursor: 'pointer'}} onClick={() => {
                                                                        removeSubPackage(i)
                                                                    }}></i></td>
                                                                </tr>
                                                            </>).reverse() || <p style={{
                                                                width: '100%',
                                                                textAlign: 'left',
                                                                color: '#6e6e6e'
                                                            }}>No Data Entries</p>}
                                                        </table>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </> : null}

                                        <Row>
                                            <Col>
                                                <div className="text-end">
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary save-user">
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
                </Container>
            </div>
            <ToastContainer/>
        </React.Fragment>
    );
};


export default withAuth(ManagePackage);
