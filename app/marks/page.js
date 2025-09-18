'use client';

import { useState } from 'react';
import { Table, InputGroup, Form } from 'react-bootstrap';
import { FaClipboardList, FaSearch } from 'react-icons/fa';

const initialMarks = [
  { id: 1, student: "John Doe", subject: "Math", mark: 85 },
  { id: 2, student: "Jane Smith", subject: "English", mark: 92 },
  { id: 3, student: "David Lee", subject: "Science", mark: 78 },
];

export default function Marks() {
  const [marks, setMarks] = useState(initialMarks);
  const [search, setSearch] = useState("");

  const filteredMarks = marks.filter(item =>
    item.student.toLowerCase().includes(search.toLowerCase()) ||
    item.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white shadow rounded-xl max-w-6xl mx-auto mt-8 p-8">
      {/* Heading with icon */}
      <div className="flex items-center gap-3 mb-6">
        <FaClipboardList className="text-2xl text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Marks List</h2>
      </div>
      {/* Search box */}
      <InputGroup className="mb-6" style={{ maxWidth:400 }}>
        <InputGroup.Text>
          <FaSearch />
        </InputGroup.Text>
        <Form.Control
          placeholder="Search student or subject..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </InputGroup>

      {/* Table */}
      <Table bordered hover striped responsive>
        <thead className="table-primary">
          <tr>
            <th>#</th>
            <th>Student</th>
            <th>Subject</th>
            <th>Mark</th>
          </tr>
        </thead>
        <tbody>
          {filteredMarks.length > 0 ? (
            filteredMarks.map((row, i) => (
              <tr key={row.id}>
                <td>{i + 1}</td>
                <td>{row.student}</td>
                <td>{row.subject}</td>
                <td>{row.mark}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">No records found</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
