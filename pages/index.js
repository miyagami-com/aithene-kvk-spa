import Head from 'next/head'
import Image from 'next/image'
import axios from 'axios';

import {Button, Layout, PageHeader} from 'antd';
import {CloudUploadOutlined, DownloadOutlined} from '@ant-design/icons';
import {TableComponent} from "../components/Table";
import {useEffect, useState} from "react";
//import * as XLSX from 'xlsx';

const {Header, Content, Footer} = Layout;

export default function Home() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [download, setDownload] = useState(null)
    const [downloading, setDownloading] = useState(false);
    const [upload, setUpload] = useState(null)
    const [uploading, setUploading] = useState(false);

    const [data, setData] = useState([]);

    const fetchData  = async (query) => {
        setLoading(true);
        try {
            await axios.get(`/api/${encodeURIComponent(query)}`).then((res) => {
                console.log("DATAAA: ",res.data)
                setData(res.data);
                setLoading(false);
            })
        } catch (e) {
            setLoading(false);
        }
    }

    useEffect(() => {
        console.log(data)
    },[data])

    return (
        <Layout className="layout" theme="light">
            <Header theme="light">
                <div className="logo"/>
                <Button
                    loading={loading}
                    disabled={loading}
                    onClick={() => fetchData("TechNet Business Development Group")}
                >
                    click Me
                </Button>
                <Button
                    icon={<CloudUploadOutlined />}
                    disabled={upload}
                    loading={uploading}
                >
                    Upload
                </Button>
                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    disabled={!download}
                    loading={downloading}
                >
                    Download
                </Button>

            </Header>
            <Content style={{padding: '40px'}}>
                <PageHeader
                    className="site-page-header"
                    title={data?.name || "Search query"}
                    subTitle={`${data?.items?.length || ''} ${data?.items?.length ? 'Results' : ''}`}
                />
                <div className="site-layout-content">
                    <TableComponent data={data?.items} setData={setData}/>
                </div>
            </Content>
            <Footer style={{textAlign: 'center'}}>Created with <span role="image">❤️</span>by
                <a href="https://miyagami.com" target="_blank" rel="noreferrer noopener"> Miyagami</a></Footer>
        </Layout>
    );
}
