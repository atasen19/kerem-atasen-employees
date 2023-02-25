import { useState } from 'react';
import { Button, Table, Row, Col, Divider, Form, Input, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
function App() {
	const [form] = Form.useForm();
	const [file, setFile] = useState();
	const [loading, setLoading] = useState(false);
	const [tableData, setTableData] = useState([]);
	const [btnDisabled, setBtnDisabled] = useState(true);
	// EmployeeID, ProjectID, DateFrom, DateTo(null === today)
	const columns = [
		{
			title: 'Employee ID #1',
			dataIndex: 'emA',
			key: 'emA',
			align: 'center',
		},
		{
			title: 'Employee ID #2',
			dataIndex: 'emB',
			key: 'emB',
			align: 'center',
		},
		{
			title: 'Project ID',
			dataIndex: 'projects',
			key: 'projects',
			align: 'center',
			render: (_, record) => {
				return record.details.map((item, index) => (
					<div>
						<span style={{ opacity: 0.2 }}> ProjectId {index + 1} : </span>{' '}
						{item.proj}
					</div>
				));
			},
		},
		{
			title: 'Total days worked together',
			dataIndex: 'projDays',
			key: 'projDays',
			align: 'center',
			render: (_, record) => {
				return record.details.map((item, index) => (
					<div>
						<span style={{ opacity: 0.2 }}> Project {index + 1} :</span>{' '}
						{item.days}
					</div>
				));
			},
		},
	];
	const handleClear = () => {
		setLoading(true);
		setTimeout(() => {
			setFile([]);
			form.resetFields();
			setTableData([]);
			setLoading(false);
			setBtnDisabled(true);
		}, [750]);
	};

	const csvFileToArray = (string) => {
		const csvRows = string.slice(string.indexOf('\n') + 1).split('\n');
		const data = [];
		csvRows.map((i) => data.push(i.split(',')));
		delete data[data.length - 1];
		const oneDay = 24 * 60 * 60 * 1000, // hours*minutes*seconds*milliseconds
			setDate = (YMD) => {
				let [Y, M, D] = YMD.split('-').map(Number);
				return new Date(Y, --M, D);
			};

		// group Employees by project id , change date string to JS newDate
		const Proj_Emps = data.reduce((r, [EmpID, ProjectID, DateFrom, DateTo]) => {
			let stD = setDate(DateFrom),
				enD = DateTo ? setDate(DateTo) : new Date();
			r[ProjectID] = r[ProjectID] ?? [];
			r[ProjectID].push({ EmpID, stD, enD });
			return r;
		}, {});
		// combination of pairs of employees per project
		let combination = {};
		for (let proj in Proj_Emps)
			for (let i = 0; i < Proj_Emps[proj].length - 1; i++)
				for (let j = i + 1; j < Proj_Emps[proj].length; j++) {
					let emA = Proj_Emps[proj][i];
					let emB = Proj_Emps[proj][j];

					if (
						(emA.enD <= emB.enD && emA.enD > emB.stD) ||
						(emB.enD <= emA.enD && emB.enD > emA.stD)
					) {
						let D1 = emA.stD > emB.stD ? emA.stD : emB.stD,
							D2 = emA.enD < emB.enD ? emA.enD : emB.enD,
							days = Math.ceil((D2 - D1) / oneDay),
							key = `${emA.EmpID}-${emB.EmpID}`;
						combination[key] = combination[key] ?? {
							emA: emA.EmpID,
							emB: emB.EmpID,
							sum: 0,
							details: [],
						};
						combination[key].details.push({ proj: Number(proj), days });
						combination[key].sum += days;
					}
				}

		let Result = Object.entries(combination)
			.sort((a, b) => b[1].sum - a[1].sum)
			.map(([k, v]) => v);
		setTimeout(() => {
			setTableData(Result);
			setLoading(false);
		}, 750);
	};

	const handleOnSubmit = (e) => {
		setLoading(true);
		const fileReader = new FileReader();
		e.preventDefault();

		if (file) {
			fileReader.onload = function (event) {
				const text = event.target.result;
				csvFileToArray(text);
			};

			fileReader.readAsText(file);
		}
	};

	return (
		<Row
			gutter={24}
			style={{
				margin: 10,
				padding: '50px 100px',
				border: '1px solid #a3a3a330',
				background: '#a3a3a305',
				borderRadius: 10,
			}}
		>
			<Col span={24}>
				<h1>Sirma Solutions Assignment </h1>
			</Col>
			<Col span={24}>
				<Form form={form}>
					<Form.Item
						label='Upload CSV File'
						name='uploader'
					>
						<Upload
							names='csv'
							showUploadList={true}
							action={false}
							beforeUpload={() => {
								return false;
							}}
							onChange={(e) => {
								setFile(e.file);
								setBtnDisabled(e.file ? false : true);
							}}
						>
							<Button
								size='small'
								icon={<UploadOutlined />}
								style={{ fontSize: 10 }}
							>
								Click to Upload
							</Button>
						</Upload>
					</Form.Item>
					<Form.Item>
						<Button
							type='primary'
							size='small'
							disabled={btnDisabled}
							style={{ marginRight: 10, width: 100 }}
							onClick={(e) => {
								handleOnSubmit(e);
							}}
						>
							Search
						</Button>
						<Button
							type='default'
							size='small'
							disabled={btnDisabled}
							style={{ marginRight: 10, width: 100 }}
							onClick={(e) => {
								handleClear(e);
							}}
						>
							Clear
						</Button>
					</Form.Item>
				</Form>
			</Col>
			<Divider />
			{(tableData.length > 0 || loading) && (
				<Col span={24}>
					<Table
						size='small'
						dataSource={tableData}
						columns={columns}
						bordered
						loading={loading}
					/>
				</Col>
			)}
		</Row>
	);
}

export default App;
