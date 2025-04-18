import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Input,
  Label,
  Table,
} from "reactstrap";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";

import "react-toastify/dist/ReactToastify.css";

import { baseUrl } from '../../Network';

const InviteTeacherModal = ({ isOpen, toggle }) => {
  const [email, setEmail] = useState("");
  const [invitedTeachers, setInvitedTeachers] = useState([]);

  useEffect(() => {
    fetchInvitedTeachers();
  }, []);

  const fetchInvitedTeachers = async () => {
    try {
      const response = await axios.get(`${baseUrl}/admin/teacher/invites`);
      setInvitedTeachers(response.data.data);
    } catch (error) {
      console.error("Failed to fetch invited teachers", error);
    }
  };

  const inviteTeacher = async () => {
    try {
      const response = await axios.post(`${baseUrl}/admin/teacher/invite`, {
        email,
      });
      if (response.data.status) {
        toast.success("Teacher invited successfully");
        fetchInvitedTeachers();
      } else {
        toast.error(response.data.message || "Failed to invite teacher");
      }
    } catch (error) {
      toast.error("Failed to invite teacher");
      console.error("Failed to invite teacher", error);
    }
  };

  const removeInviteTeacher = async (id) => {
    try {
      const response = await axios.delete(
        `${baseUrl}/admin/teacher/invite/remove/${id}`
      );
      if (response.data.status) {
        toast.success("Teacher invite removed successfully");
        fetchInvitedTeachers();
      } else {
        toast.error(response.data.message || "Failed to remove teacher invite");
      }
    } catch (error) {
      toast.error("Failed to remove teacher invite");
      console.error("Failed to remove teacher invite", error);
    }
  };

  const handleInvite = () => {
    inviteTeacher();
    toggle();
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>Invite Teacher</ModalHeader>
        <ModalBody>
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={handleInputChange}
            placeholder="Enter email"
          />
          <Button color="primary" className="mt-3" onClick={handleInvite}>
            Invite
          </Button>

          <Table className="mt-4">
            <thead>
              <tr>
                <th>Email</th>
                <th>Link Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invitedTeachers && invitedTeachers.length > 0 ? (
                invitedTeachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>{teacher.email}</td>
                    <td>{teacher.isUsed ? "Used" : "Not Used"}</td>
                    <td>
                      <Link
                        className="text-danger"
                        to="#"
                        onClick={() => removeInviteTeacher(teacher.id)}
                      >
                        <i className="mdi mdi-delete font-size-18"></i>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No invited email</td>
                </tr>
              )}
            </tbody>
          </Table>
        </ModalBody>
      </Modal>

      <ToastContainer />
    </>
  );
};

export default InviteTeacherModal;
