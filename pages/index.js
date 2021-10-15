import Head from 'next/head'
import Image from 'next/image'
import axios from 'axios';

import {Button, Layout, message, PageHeader, Upload} from 'antd';
import {CloudUploadOutlined, DownloadOutlined} from '@ant-design/icons';
import {TableComponent} from "../components/Table";
import {useEffect, useState} from "react";
import * as XLSX from 'xlsx';

const {Header, Content, Footer} = Layout;

export default function Home() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [download, setDownload] = useState(null)
    const [downloading, setDownloading] = useState(false);
    const [currentStep, setCurrentStep] = useState(null)
    const [upload, setUpload] = useState(null)
    const [uploading, setUploading] = useState(false);

    const [data, setData] = useState([]);
    axios.defaults.timeout = 10000;

    const fetchData = async (query) => {
        console.log(encodeURIComponent(query));
        setLoading(true);
        try {
            await axios.get(`/api/${encodeURIComponent(query)}`).then((res) => {
                setData(res.data);
                setLoading(false);
            })
        } catch (e) {
            message.error("Error occured looking for data")
            setLoading(false);
        }
    }

    const readFile = (file) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
            // evt = on_file_select event
            /* Parse data */
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: "binary" });
            /* Get first worksheet */
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            /* Convert array of arrays */
            const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
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

    const uploadProps = {
        name: 'file',
        accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        maxCount: 1,
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

    const incrementStep = () => {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep)
        fetchData(upload[currentStep].name)
    }

    useEffect(() => {
        console.log(data)
    }, [data])

    return (
        <Layout className="layout" theme="light">
            <Header theme="light">
                <div className="logo"/>
            </Header>
            <Content style={{padding: '40px'}}>
                <PageHeader
                    className="site-page-header"
                    title={`${currentStep ? `${currentStep} / ${upload?.length}` : ''} ${data?.name || "Search query"}`}
                    subTitle={`${data?.items?.length || ''} ${data?.items?.length ? 'Results' : ''}`}
                />
                <div style={{display: 'flex', flexDirection: 'row'}}>
                    <Button
                        loading={loading}
                        disabled={loading}
                        onClick={() => incrementStep()}
                    >
                       Next step
                    </Button>
                    <Button
                        type="primary"
                        icon={<DownloadOutlined/>}
                        disabled={!download}
                        loading={downloading}
                    >
                        Download
                    </Button>
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
                </div>
                <div className="site-layout-content">
                    <TableComponent data={data?.items} setData={setData}/>
                </div>
            </Content>
            <Footer style={{textAlign: 'center'}}>Created with <span role="image">❤️</span>by
                <a href="https://miyagami.com" target="_blank" rel="noreferrer noopener"> Miyagami</a></Footer>
        </Layout>
    );
}
