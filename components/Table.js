import React from 'react';
import {Table} from 'antd';

const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
        render: (name, item) => <a href={item.href} target="_blank" rel="noreferrer noopener">{name}</a>,
    },
    {
        title: 'KVK',
        dataIndex: 'kvk',
    },
];

export const TableComponent = ({data, rowSelection}) => {
    return (
        <div>
            <Table
                rowSelection={{
                    type: 'radio',
                    ...rowSelection,
                }}
                rowKey={record => record.kvk}
                columns={columns}
                dataSource={data}
            />
        </div>
    );
};
