import {useEffect, useState} from "react";
import useWindowSize from "../utils/useWindowSize";
import {TableComponent} from "../components/Table";
import Image from 'next/image';

import * as XLSX from 'xlsx';
import axios from 'axios';

import {
    Button,
    Descriptions,
    Input,
    Layout,
    message,
    Modal,
    PageHeader,
    Statistic,
    Tag,
    Typography,
    Upload
} from 'antd';
import {CloudUploadOutlined, DownloadOutlined} from '@ant-design/icons';

const {Header, Content, Footer} = Layout;
const {Title} = Typography;
const {Search} = Input;

export default function Home() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [download, setDownload] = useState(null)
    const [downloading, setDownloading] = useState(false);
    const [currentStep, setCurrentStep] = useState(null)
    const [upload, setUpload] = useState(null)
    const [uploading, setUploading] = useState(false);
    const [data, setData] = useState([]);
    const [title, setTitle] = useState(null)
    const {width} = useWindowSize();

    const isMobile = width < 768;
    axios.defaults.timeout = 14000;

    const uploadProps = {
        name: 'file',
        accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        action: '/api/file',
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
                setFileName(info.file.name.replace(/\.[^/.]+$/, ""))
                setUploading(false)
            } else if (info.file.status === 'error') {
                setUploading(false)
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };

    const validateData = (data, key) => {
        return [
            ...new Map(data.filter((item) => item.name).map(item => [key(item), item])).values()
        ]
    }

    const fetchData = async (query) => {
        let validatedData = null;
        setLoading(true);
        try {
            await axios.get(`/api/${encodeURIComponent(query)}`).then((res) => {
                validatedData = validateData(res.data !== {} ? res.data : [], item => item.kvk)
                setData(validatedData);
                setTitle(query);
                setLoading(false);
            })
        } catch (e) {
            console.log(e)
            message.error("Error occurred looking for data")
            setData([])
            setTitle(query);
            setLoading(false);
        }

    }
    const readFile = (file) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, {type: "binary"});
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            let data = JSON.parse(convertToJson(XLSX.utils.sheet_to_csv(ws, {header: 1})));
            data.pop();
            setUpload(data);
            fetchData(data[0].name)
        };
        reader.readAsBinaryString(file);
    }

    const downloadFile = () => {
        if (!download) return;
        setDownloading(true)
        const blob = new Blob([s2ab(download)], {type: "application/octet-stream"});
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${fileName}-${+new Date().toLocaleDateString()}.xlsx`;
        link.click();
        setDownloading(false);
        setUpload(null);
        setDownload(null);
        setCurrentStep(null);
        setTitle(null);
        setData([]);
        setFileName(null);
    };

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
        return JSON.stringify(result);

    }

    const generateTags = () => {
        const words = title?.split(' ')
        return words?.length > 1 && !isMobile && words?.map((word) => (
            <Button key={word} style={{padding: 0}} type="link" onClick={() => fetchData(word)}>
                <Tag color="blue">{word}</Tag>
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
                temp[currentStep - 1].kvk_link = selectedRows[0].href[0];
                setUpload(temp);
                incrementStep();
            }
        },
    };

    const incrementStep = () => {
        const nextStep = currentStep + 1;
        if (nextStep > upload.length) {
            setDownloading(true);
            const wb = XLSX.utils.book_new();
            wb.Props = {
                Title: "KVK Scraper",
                Subject: "MIT LICENSE",
                Author: "Miyagami BV",
                CreatedDate: new Date()
            };
            wb.SheetNames.push("Items");
            wb.Sheets["Items"] = XLSX.utils.json_to_sheet(upload);
            const wbout = XLSX.write(wb, {bookType: 'xlsx', type: 'binary'});
            setDownload(wbout);
            setDownloading(false)
        } else {
            setCurrentStep(nextStep)
            fetchData(upload[currentStep].name)
        }
    }

    function s2ab(s) {
        const buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
        const view = new Uint8Array(buf);  //create uint8array as viewer
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
        return buf;
    }

    useEffect(() => {
        console.log(upload)
    }, [data])

    return (
        <Layout className="layout" theme="light">
            <Header style={{
                background: 'white',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: "space-between",
                height: 'auto',
                padding: "14px 30px"
            }}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection:'row',
                        alignItems: "center"
                    }}
                >
                    <Image src='/aithena-logo.png' width={140} height={40} />
                    {fileName ?
                        <Statistic style={{marginLeft: 30}} title="Filename" value={fileName}/>
                        :
                        <Title style={{marginLeft: 30}} className="logo" level={3}>
                            {fileName || 'KVK Scraper'}
                        </Title>
                    }
                </div>
                <div style={{
                    display: "flex",
                    flexDirection: isMobile ? 'column' : 'row',
                }}>
                    <Search
                        placeholder="Input search text"
                        style={{
                            width: isMobile ? 'auto' : 300,
                            alignSelf: !isMobile && "center",
                            marginRight: 14,
                        }}
                        onSearch={(value) => fetchData(value)}
                        loading={loading}
                    />
                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        {!upload &&
                        <Upload {...uploadProps}>
                            <Button
                                style={{
                                    marginRight: 14
                                }}
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
                            style={{
                                marginRight: 14
                            }}
                            disabled={loading || download}
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
                            onClick={() => downloadFile()}
                        >
                            Download
                        </Button>
                    </div>
                </div>
            </Header>
            <Content style={{padding: '10px 30px'}}>
                <PageHeader
                    className="site-page-header"
                    title={`${title || "Search query"}`}
                    subTitle={`${data?.length || ''} ${data?.length ? 'Results' : ''}`}
                    tags={generateTags()}
                    extra={[
                        currentStep &&
                        <a
                            style={{
                                display: 'flex',
                                width: 'max-content',
                                justifyContent: 'flex-end',
                            }}
                            onClick={() => setIsModalVisible(true)}>
                            <Statistic title="Items" value={currentStep} suffix={`/ ${upload?.length}`}/>
                        </a>
                    ]}
                />
                <div className="site-layout-content">
                    <TableComponent data={data} setData={setData} rowSelection={rowSelection} loading={loading}/>
                </div>
            </Content>
            <Footer style={{textAlign: 'center'}}>Created with <span role="image">❤️</span> by
                <a href="https://miyagami.com" target="_blank" rel="noreferrer noopener"> Miyagami</a>
            </Footer>
            <Modal
                title={upload?.[currentStep - 1]?.name || 'Description modal'}
                visible={isModalVisible}
                onOk={() => setIsModalVisible(false)}
                onCancel={() => setIsModalVisible(false)}
            >
                <Descriptions
                    title={`${upload?.[currentStep - 1]?.name} information`}
                    bordered
                    column={1}
                >
                    {upload && Object.entries(upload[currentStep - 1]).map(([key, value]) => (
                        <Descriptions.Item key={key} label={key}>{value}</Descriptions.Item>
                    ))
                    }
                </Descriptions>
            </Modal>
        </Layout>
    );
}
