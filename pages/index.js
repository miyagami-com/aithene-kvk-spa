import axios from 'axios';

import {Button, Input, Layout, message, PageHeader, Statistic, Tag, Typography, Upload} from 'antd';
import {CloudUploadOutlined, DownloadOutlined} from '@ant-design/icons';
import {TableComponent} from "../components/Table";
import {useEffect, useState} from "react";
import * as XLSX from 'xlsx';

const {Header, Content, Footer} = Layout;
const {Title} = Typography;
const {Search} = Input;

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [download, setDownload] = useState(null)
    const [downloading, setDownloading] = useState(false);
    const [currentStep, setCurrentStep] = useState(null)
    const [upload, setUpload] = useState(null)
    const [uploading, setUploading] = useState(false);
    const [data, setData] = useState([]);
    const [title, setTitle] = useState(null)

    axios.defaults.timeout = 5000;

    const fetchData = async (query) => {
        console.log(encodeURIComponent(query));
        setLoading(true);
        try {
            await axios.get(`/api/${encodeURIComponent(query)}`).then((res) => {
                setData(res.data);
                setTitle(query);
                setLoading(false);
            })
        } catch (e) {
            console.log(e)
            message.error("Error occured looking for data")
            setTitle(query);
            setLoading(false);
        }
    }

    const readFile = (file) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
            // evt = on_file_select event
            /* Parse data */
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, {type: "binary"});
            /* Get first worksheet */
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            /* Convert array of arrays */
            const data = XLSX.utils.sheet_to_csv(ws, {header: 1});
            /* Update state */
            setUpload(JSON.parse(convertToJson(data))); // shows data in json format
            fetchData(JSON.parse(convertToJson(data))[0].name)
            console.log(JSON.parse(convertToJson(data)))
        };
        reader.readAsBinaryString(file);
    }

    const convertToJson = (csv) => {
        const lines = csv.split("\n");

        const result = [];

        const headers = lines[0].split(",");

        for (let i = 1; i < lines.length; i++) {
            const obj = {};
            const currentline = lines[i].split(",");

            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentline[j];
            }

            result.push(obj);
        }

        //return result; //JavaScript object
        return JSON.stringify(result); //JSON
    }

    const handleSearch = (val) => {
        fetchData(val);
    };

    const uploadProps = {
        name: 'file',
        accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        maxCount: 1,
        showUploadList: false,
        headers: {
            authorization: 'authorization-text',
        },
        async onChange(info) {
            if (info.file.status !== 'uploading') {
                setUploading(true)
            }
            if (info.file.status === 'done') {
                readFile(info.fileList[0].originFileObj)
                setCurrentStep(1);
                message.success(`${info.file.name} file uploaded successfully`);
                setUploading(false)
            } else if (info.file.status === 'error') {
                setUploading(false)
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };

    const generateTags = () => {
        const words = title?.split(' ')
        return words?.length > 1 && words?.map((word) => (
            <Button style={{padding: 0}} type="link" onClick={() => fetchData(word)}>
                <Tag key={word} color="blue">{word}</Tag>
            </Button>
        ))
    }

    // rowSelection object indicates the need for row selection
    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            if (currentStep) {
                const temp = upload;
                temp[currentStep - 1].kvk_name = selectedRows[0].name;
                temp[currentStep - 1].kvk_number = selectedRows[0].kvk;
                temp[currentStep - 1].kvk_link = selectedRows[0].link;
                // upload[currentStep - 1].kvk-name = selectedRows[0].name
                setUpload(temp);
                incrementStep();
            }
            console.log('selectedRows: ', selectedRows);
        },
    };


    const incrementStep = () => {
        const nextStep = currentStep + 1;
        if (currentStep >= upload.length) {
            setDownloading(true);
            const wb = XLSX.utils.book_new();
            wb.Props = {
                Title: "KVK Scraper",
                Subject: "MIT LICENSE",
                Author: "Miyagami BV",
                CreatedDate: new Date()
            };
            wb.SheetNames.push("Items");
            const ws = XLSX.utils.json_to_sheet(JSON.stringify(upload));
            wb.Sheets["Items"] = ws;
            const wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});
            setDownload(wbout)
        } else {
            setCurrentStep(nextStep)
            fetchData(upload[currentStep].name)
        }
    }

    function s2ab(s) {
        const buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
        const view = new Uint8Array(buf);  //create uint8array as viewer
        for (let i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
        return buf;
    }

    useEffect(() => {
        console.log(data)
    }, [data])

    return (
        <Layout className="layout" theme="light">
            <Header style={{background: 'white', display: 'flex', flexDirection: 'row'}}>
                <Title className="logo" level={3}>KVK Scraper</Title>
                <Search
                    placeholder="input search text"
                    style={{
                        width: 300,
                        margin: 'auto'
                    }}
                    onSearch={(value) => fetchData(value)}
                    enterButton
                    loading={loading}
                />
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    {!upload &&
                    <Upload {...uploadProps}>
                        <Button
                            icon={<CloudUploadOutlined/>}
                            disabled={uploading}
                            type="upload"
                            loading={uploading}
                        >
                            Upload
                        </Button>
                    </Upload>
                    }
                    {upload &&
                    <Button
                        disabled={loading}
                        onClick={() => incrementStep()}
                    >
                        Next step
                    </Button>
                    }
                    <Button
                        type="primary"
                        icon={<DownloadOutlined/>}
                        disabled={!download}
                        loading={downloading}
                    >
                        Download
                    </Button>
                </div>
            </Header>
            <Content style={{padding: '10px 30px'}}>
                <PageHeader
                    className="site-page-header"
                    title={`${title || "Search query"}`}
                    subTitle={`${data?.length || ''} ${data?.length ? 'Results' : ''}`}
                    tags={generateTags()}
                    extra={[currentStep &&  <Statistic title="Items" value={currentStep} suffix={`/ ${upload?.length}`} />]}
                />
                <div className="site-layout-content">
                    <TableComponent data={data} setData={setData} rowSelection={rowSelection}/>
                </div>
            </Content>
            <Footer style={{textAlign: 'center'}}>Created with <span role="image">❤️</span>by
                <a href="https://miyagami.com" target="_blank" rel="noreferrer noopener"> Miyagami</a></Footer>
        </Layout>
    );
}
