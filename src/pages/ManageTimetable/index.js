import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DeleteModal from "../../components/Common/DeleteModal";
import * as Yup from "yup";
import { useFormik } from "formik";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import withAuth from '../withAuth';
import axios from "axios";
import { baseUrl } from '../../Network';
import { Col, Container, Row } from "reactstrap";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// Define arrays for days and times
export const WeekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const WeekColors = ["#000", "#028178", "#ff6e00", "#044488", "#FF00A6FF", "#047E00FF", "#6D00B9FF"];

const ManageTimeTable = () => {
    document.title = "Manage Time Table | RYD Admin";
    const [timetables, setTimetables] = useState([]);
    const [groupTime, setGroupTime] = useState([]);
    const [groupTimeUp, setGroupTimeUp] = useState([]);
    const [groupTimeMultiple, setGroupTimeMultiple] = useState([]);
    const [multipleData, setMultipleData] = useState([]);
    const [groupTimeMultipleUp, setGroupTimeMultipleUp] = useState([]);
    const [groupTimeTitle, setGroupTimeTitle] = useState("");
    const [groupTimeTitleUp, setGroupTimeTitleUp] = useState("");
    const [weeksDayPicker, setWeeksDayPicker] = useState(0);
    const [isMultipleGroup, setIsMultipleGroup] = useState(false);
    const [check, setCheck] = useState(false);
    const [isMultipleGroupUp, setIsMultipleGroupUp] = useState(false);
    const [timeGroupData, setTimeGroupData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRecentList, setIsRecentList] = useState(false);
    const [isMultiUp, setIsMultiUpd] = useState(false);
    const [updateSet, setUpdateSet] = useState(0);
    useEffect(() => {
        fetchTimetables();
    }, []); // Fetch timetables once on component mount

    const fetchTimetables = async () => {
        try {
            const response = await axios.get(`${baseUrl}/admin/timetable/all`);
            const responseTG = await axios.get(`${baseUrl}/admin/timegroup/all`);
            setTimetables(response.data.data);
            setTimeGroupData(responseTG.data.data.reverse());
        } catch (error) {
            console.error("Error:", error);
        }
    };

    //days picker
    const daysPicker = (i) => {
        setWeeksDayPicker(i)
    }


    const addToGroupList = (f) => {
        setMultipleData(prevData => [...prevData, f]);
        // Apply similar logic to other state updates
        if (updateSet) {
          if (!isMultiUp) {
            setGroupTimeUp([...groupTimeUp, f])
          } else {
            setGroupTimeMultipleUp(prevGroup => {
                const updatedGroups = [...prevGroup];
                if (!check) {
                    setCheck(true)
                  return [...prevGroup,[f]];
                }

                updatedGroups[updatedGroups.length - 1].push(f);
                return updatedGroups;
              });
          }
        } else {
            setGroupTime([...groupTime, f])
        }
      };



    const addToMultiGroupList = () => {
        if (groupTime.length > 0) {
            setGroupTimeMultiple([...groupTimeMultiple, groupTime])
            setGroupTime([])
        }
    }

    const removeTimeGroup = (i) => {
        if (confirm("Confirm to remove this item")) {
            setGroupTime(groupTime.filter(x => x.id !== i))
        }
    }

    const removeTimeGroupUp = (i) => {
        if (confirm("Confirm to remove and update this item")) {
            setGroupTimeUp(groupTimeUp.filter(x => x.id !== i))
        }
    }

    const removeTimeGroupMulti = (i) => {
        if (confirm("Confirm to remove this item")) {
            setGroupTimeMultiple(groupTimeMultiple.filter((x, k) => k !== i))
        }
    }

    const removeTimeGroupMultiUp = (i) => {
        if (confirm("Confirm to remove and update this item")) {
            setGroupTimeMultipleUp(groupTimeMultipleUp.filter((x, k) => k !== i))
        }
    }

    const submitUpdatedTimeSheet = async () => {
        setIsLoading(true)
        //create single time stamp
        if (groupTimeTitleUp.length > 0) {
            if (!isMultipleGroupUp) {
                const response = await axios.post(
                    `${baseUrl}/admin/timegroup/update/${updateSet}`,
                    { times: groupTimeUp }
                );
                if (response.data.status) {
                    toast.success("TimeGroup updated successfully")
                    setTimeout(() => {
                        window.location.reload()
                    }, 2000)
                } else {
                    toast.warn("Unable to update timeGroup")
                }
            } else {
                //create for multiple groups
                const response = await axios.post(
                    `${baseUrl}/admin/timegroup/update/${updateSet}`,
                    { times: groupTimeMultipleUp }
                );
                if (response.data.status) {
                    toast.success("Multiple TimeGroup updated successfully")
                    setTimeout(() => {
                        window.location.reload()
                    }, 2000)
                } else {
                    toast.warn("Unable to update timeGroup")
                }
            }
        } else {
            toast.warn("Please specify group to update")
        }
        setIsLoading(false)
    }

    const setUpdatePanel = (i) => {
        setUpdateSet(timeGroupData[i].id)
        setGroupTimeTitleUp(timeGroupData[i].title)

        const parsedTimeSlots = Array.isArray(timeGroupData[i].times)
            ? timeGroupData[i].times
            : JSON.parse(timeGroupData[i].times);

        const isMulti = parsedTimeSlots[0]?.id
        if (isMulti) {
            setIsMultiUpd(false)
            setIsMultipleGroupUp(false)
            console.log(parsedTimeSlots)
            setGroupTimeUp(parsedTimeSlots)
            setGroupTimeMultipleUp([])
        } else {
            setIsMultiUpd(true)
            setIsMultipleGroupUp(true)
            setGroupTimeMultipleUp(parsedTimeSlots)
            setGroupTimeUp([])
        }
    }

    //submitTask
    const submitTimeSheet = async () => {
        setIsLoading(true)
        //create single time stamp
        if (groupTimeTitle.length > 0) {
            if (!isMultipleGroup) {
                const response = await axios.post(
                    `${baseUrl}/admin/timegroup/create`,
                    { title: groupTimeTitle, times: groupTime }
                );
                if (response.data.status) {
                    toast.success("TimeGroup created successfully")
                    setTimeout(() => {
                        window.location.reload()
                    }, 1000)
                } else {
                    toast.warn("Unable to create timeGroup")
                }
            } else {
                //create for multiple groups
                const response = await axios.post(
                    `${baseUrl}/admin/timegroup/create`,
                    { title: groupTimeTitle, times: groupTimeMultiple }
                );
                if (response.data.status) {
                    toast.success("Multiple TimeGroup created successfully")
                    setTimeout(() => {
                        window.location.reload()
                    }, 1000)
                } else {
                    toast.warn("Unable to create timeGroup")
                }
            }
        } else {
            toast.warn("Please specify group title")
        }
        setIsLoading(false)
    }
    // console.log(groupTimeMultipleUp)
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Dashboard" breadcrumbItem="Manage Timetable" />
                    <Row>
                        <Col lg="2">
                            <Row className="align-items-center">
                                <Col md={6}>
                                    <div className="mb-3">
                                        <h5 className="card-title">
                                            Week Days
                                        </h5>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Row xl="12">
                                    {WeekDays.map((t, i) => <>
                                        <button
                                            className={`btn ${weeksDayPicker === i ? 'btn-primary' : 'btn-outline-secondary'} d-inline-block`}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                daysPicker(i)
                                            }} style={{ height: 50, marginTop: 20 }}>{t} <i
                                                className="bx bx-check-circle font-size-12"
                                                style={{ color: WeekColors[i] }}></i></button>
                                    </>)}

                                </Row>
                            </Row>
                        </Col>

                        <Col lg="6">
                            <Row className="align-items-center">
                                <Col md={6}>
                                    <div className="mb-3">
                                        <h5 className="card-title">
                                            Timetable List{" "}
                                            <span className="text-muted fw-normal ms-2">
                                                ({timetables.length})
                                            </span>
                                        </h5>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col xl="12">
                                    {timetables.length === 0 ? (
                                        <p className="text-center">No timetable yet</p>
                                    ) : (
                                        <table className="table align-middle">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Day of Week</th>
                                                    <th>Week Abbr</th>
                                                    <th>Time</th>
                                                    <th>Hour</th>
                                                    <th>Timezone</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {timetables.filter(f => f.day === weeksDayPicker).map((data, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{data.dayText}</td>
                                                        <td>{data.dayAbbr}</td>
                                                        <td>{data.timeText}</td>
                                                        <td>{data.timex}</td>
                                                        <td>WAT +1 GMT</td>
                                                        <td>
                                                            <Link
                                                                className="text-success"
                                                                to="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault()
                                                                    addToGroupList(data)
                                                                }}>
                                                                <i className="bx bx-arrow-to-right font-size-18"></i>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </Col>
                            </Row>
                        </Col>

                        {!isRecentList ?
                            <Col lg="4">
                                <Row className="align-items-center">
                                    <Col md={12}>
                                        <div className="mb-3">
                                            <h5 className="card-title">
                                                <Row xl={12}>
                                                    <Col xl={8}>
                                                        Create {isMultipleGroup ? "Multiple" : "Single"} TimeGroup
                                                    </Col>
                                                    <Col xl={4}>
                                                        <a href={'#'} onClick={(e) => {
                                                            setIsRecentList(true)
                                                        }}>Recent List</a>
                                                    </Col>
                                                </Row>
                                            </h5>
                                            <a href={'#'} onClick={(e) => {
                                                e.preventDefault()
                                                setIsMultipleGroup(!isMultipleGroup)
                                            }}>{isMultipleGroup ? "Create Single Group" : "Create Multiple Group"}</a>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xl="12">
                                        <div className="col-md-12 mb-3">
                                            <table style={{ width: '100%' }}>
                                                <tr>
                                                    <th>Day</th>
                                                    <th>Abbr</th>
                                                    <th>Hour</th>
                                                    <th>Time</th>
                                                    <th>TimeZone</th>
                                                    <th></th>
                                                </tr>
                                                {groupTime?.map((t, i) => <>
                                                    <tr>
                                                        <td style={{ color: WeekColors[t.day] }}>{t.dayText}</td>
                                                        <td style={{ color: WeekColors[t.day] }}>{t.dayAbbr}</td>
                                                        <td>{t.timex}</td>
                                                        <td>{t.timeText}</td>
                                                        <td>WAT +1 GMT</td>
                                                        <td><i className="bx bx-x font-size-18"
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => {
                                                                removeTimeGroup(t.id)
                                                            }}></i></td>
                                                    </tr>
                                                </>) ||
                                                    <p style={{ width: '100%', textAlign: 'left', color: '#6e6e6e' }}>No
                                                        New
                                                        Group Entries</p>}
                                            </table>
                                            <div className={'mt-3 mb-3'}>
                                                {isMultipleGroup ? <>
                                                    <a href={'#'} onClick={(e) => {
                                                        e.preventDefault()
                                                        addToMultiGroupList()
                                                    }} className={'d-inline-flex'}><i
                                                        className="bx bx-arrow-to-bottom font-size-20"></i> Add to
                                                        Multi-Group</a>
                                                </> : null}
                                            </div>

                                            {isMultipleGroup ? <>
                                                <hr />
                                                <table style={{ width: '100%' }}>
                                                    <tr>
                                                        <th>Group</th>
                                                        <th>Week Day</th>
                                                        <th>Hour</th>
                                                        <th>Time</th>
                                                        <th></th>
                                                    </tr>
                                                    {groupTimeMultiple?.length > 0 && groupTimeMultiple?.map((t, i) => <>
                                                        <tr style={{ backgroundColor: '#f6f5f5' }}>
                                                            <td style={{ fontWeight: 'bold' }}>Group #{i}</td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td>
                                                                <a href={'#'} onClick={(e) => {
                                                                    e.preventDefault()
                                                                    removeTimeGroupMulti(i)
                                                                }} className={'d-inline-flex'}><i
                                                                    className="bx bx-trash font-size-15"></i></a>
                                                            </td>
                                                        </tr>
                                                        {
                                                            t.map((c, j) => <>
                                                                <tr>
                                                                    <td>-</td>
                                                                    <td style={{ color: WeekColors[c.day] }}>{c.dayText}</td>
                                                                    <td>{c.timex}</td>
                                                                    <td>{c.timeText}</td>
                                                                    <td></td>
                                                                </tr>
                                                            </>)
                                                        }
                                                    </>) ||
                                                        <p style={{
                                                            width: '100%',
                                                            textAlign: 'left',
                                                            color: '#6e6e6e'
                                                        }}>No
                                                            New
                                                            Multi-Group Entries</p>}
                                                </table>
                                                <hr />
                                            </> : null}
                                            <input onChange={e => setGroupTimeTitle(e.target.value)}
                                                value={groupTimeTitle}
                                                placeholder={"Group Name"}
                                                className={'w-100 form-control mb-3 mt-3'} />
                                            <button disabled={isLoading} onClick={submitTimeSheet}
                                                className={'btn btn-primary w-100'}>{isLoading ? "Please wait..." : `Create ${isMultipleGroup ? "Multiple" : "Single"} Group`}</button>
                                        </div>
                                    </Col>
                                </Row>
                            </Col> :
                            <Col lg="4">
                                <Row className="align-items-center">
                                    <Col md={12}>
                                        <div className="mb-3">
                                            <h5 className="card-title">
                                                <Row xl={12}>
                                                    <Col xl={8}>
                                                        View Recent List
                                                    </Col>
                                                    <Col xl={4}>
                                                        <a href={'#'} onClick={(e) => {
                                                            setIsRecentList(false)
                                                        }}>Create New Group</a>
                                                    </Col>
                                                </Row>
                                            </h5>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xl="12">
                                        <div className="col-md-12 mb-3">
                                            <table style={{ width: '100%' }}>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Title</th>
                                                    <th>Type</th>
                                                    <th></th>
                                                </tr>
                                                {timeGroupData.map((it, index) => {
                                                    return <tr key={index} style={{ cursor: 'pointer' }} onClick={() => setUpdatePanel(index)}>
                                                        <td>{index + 1}</td>
                                                        <td>{it.title}</td>
                                                        <td>{it?.times[0]?.id ? "Single" : "Multiple"}</td>
                                                        <td>-</td>
                                                    </tr>
                                                })}
                                            </table>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xl="12">
                                        <div className="col-md-12 mb-3">
                                            {!isMultipleGroupUp ? <>
                                                <table style={{ width: '100%', display: updateSet > 0 ? '' : 'none' }}>
                                                    <tr>
                                                        <th>Day</th>
                                                        <th>Abbr</th>
                                                        <th>Hour</th>
                                                        <th>Time</th>
                                                        <th>TimeZone</th>
                                                        <th></th>
                                                    </tr>
                                                    {groupTimeUp?.map((t, i) => <>
                                                        <tr>
                                                            <td style={{ color: WeekColors[t.day] }}>{t.dayText}</td>
                                                            <td style={{ color: WeekColors[t.day] }}>{t.dayAbbr}</td>
                                                            <td>{t.timex}</td>
                                                            <td>{t.timeText}</td>
                                                            <td>WAT +1 GMT</td>
                                                            <td><i className="bx bx-x font-size-18"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => {
                                                                    removeTimeGroupUp(t.id)
                                                                }}></i></td>
                                                        </tr>
                                                    </>) ||
                                                        <p style={{ width: '100%', textAlign: 'left', color: '#6e6e6e' }}>No
                                                            New
                                                            Group Entries</p>}
                                                </table>
                                            </> : null}
                                            {isMultipleGroupUp ? <>
                                                <hr />
                                                <table style={{ width: '100%' }}>
                                                    <tr>
                                                        <th>Group</th>
                                                        <th>Week Day</th>
                                                        <th>Hour</th>
                                                        <th>Time</th>
                                                        <th></th>
                                                    </tr>

                                                    {groupTimeMultipleUp?.length > 0 ? groupTimeMultipleUp.map((t, i) => <>
                                                        <tr style={{ backgroundColor: '#f6f5f5' }}>
                                                            <td style={{ fontWeight: 'bold' }}>Group #{i}</td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td>
                                                                <a href={'#'} onClick={(e) => {
                                                                    e.preventDefault()
                                                                    removeTimeGroupMultiUp(i)
                                                                }} className={'d-inline-flex'}><i
                                                                    className="bx bx-trash font-size-15"></i></a>
                                                            </td>
                                                        </tr>
                                                        {
                                                            t.map((c, j) => <>
                                                                <tr>
                                                                    <td>-</td>
                                                                    <td style={{ color: WeekColors[c.day] }}>{c.dayText}</td>
                                                                    <td>{c.timex}</td>
                                                                    <td>{c.timeText}</td>
                                                                    <td></td>
                                                                </tr>
                                                            </>)
                                                        }
                                                    </>) :
                                                        <p style={{
                                                            width: '100%',
                                                            textAlign: 'left',
                                                            color: '#6e6e6e'
                                                        }}>No
                                                            New
                                                            Multi-Group Entries</p>}
                                                </table>
                                                <hr />
                                            </> : null}
                                            <button style={{ display: updateSet > 0 ? 'block' : 'none' }} disabled={isLoading} onClick={submitUpdatedTimeSheet}
                                                className={'btn btn-primary w-100'}>Update [{groupTimeTitleUp}]</button>
                                        </div>
                                    </Col>
                                </Row>
                            </Col>}

                    </Row>
                </Container>
            </div>
            <ToastContainer />
        </React.Fragment>
    );
};

export default withAuth(ManageTimeTable);
