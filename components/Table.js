import React  from 'react';
import { Table} from 'antd';
const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
        render: (text) => <a>{text}</a>,
    },
    {
        title: 'KVK',
        dataIndex: 'kvk',
    },
    {
        title: 'URL',
        dataIndex: 'href',
    },
];

export const TableComponent = ({data}) => {
    return (
        <div>
            <Table
                columns={columns}
                dataSource={data}
            />
        </div>
    );
};
