'use client';

import React, { Fragment, useEffect } from "react";
import Link from "next/link";
import { Container, Col, Row } from "react-bootstrap";
import { useRouter } from "next/navigation";

import PaymentsChart from "../PaymentsChart/PaymentsChart";
import AssignmentChart from "../Assignment-chart/Assignment-chart";
import { StatRightTopIcon } from "widgets";
import { ActiveProjects, Teams, TasksPerformance } from "sub-components";
import ProjectsStatsData from "data/dashboard/ProjectsStatsData";

const DashboardPage = () => {
  const router = useRouter();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("isAuthenticated")) {
      router.replace("/Authentication/sign-in");
    }
  }, [router]);

  // Logout handler
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isAuthenticated");
    }
    router.push("/Authentication/sign-in");
  };

  return (
    <Fragment>
      <div className="bg-primary pt-10 pb-21"></div>
      <Container fluid className="mt-n22 px-6">
        <Row>
          <Col lg={12} md={12} xs={12}>
            <div className="d-flex justify-content-between align-items-center">
              <div className="mb-2 mb-lg-0">
                <h3 className="mb-0 text-white">Student Dashboard</h3>
              </div>
              <div className="d-flex gap-2">
                <Link href="#" className="btn btn-white">
                  Add Dashboard
                </Link>
              
              </div>
            </div>
          </Col>

          {ProjectsStatsData.map((item, index) => (
            <Col key={index} xl={3} lg={6} md={12} xs={12} className="mt-6">
              <StatRightTopIcon info={item} />
            </Col>
          ))}
        </Row>

        <Row className="my-6">
          <Col xl={4} lg={12} md={12} xs={12} className="mb-6 mb-xl-0">
            <TasksPerformance />
          </Col>
          <Col xl={4} lg={12} md={12} xs={12} className="mb-6 mb-xl-0">
            <PaymentsChart />
          </Col>
          <Col xl={4} lg={12} md={12} xs={12}>
            <AssignmentChart />
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default DashboardPage;
