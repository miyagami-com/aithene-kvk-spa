import React from 'react';
import {message, Table} from 'antd';
import {CopyOutlined} from "@ant-design/icons";

export const TableComponent = ({data, rowSelection, loading}) => {
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            render: (name, item) => <a href={item.href} target="_blank" rel="noreferrer noopener">{name}</a>,
        },
        {
            title: 'KVK',
            dataIndex: 'kvk',
            render: (name) =>
                <div style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center"
                }}>
                    <p style={{margin: 0}}>{name}</p>
                    <CopyOutlined style={{marginLeft: 10}} onClick={() => copyToClipboard(name)}/>
                </div>,
        },
    ];

    const copyToClipboard = (kvk) => navigator.clipboard.writeText(kvk)
        .then((res) => message.success(`Copied ${kvk} to clipboard.`));

    return (
        <div>
            <Table
                rowSelection={{
                    type: 'radio',
                    ...rowSelection,
                }}
                loading={loading}
                rowKey={record => record.kvk}
                columns={columns}
                dataSource={data}
            />
        </div>
    );
};
