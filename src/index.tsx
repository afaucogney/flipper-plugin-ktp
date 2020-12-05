import React from 'react';
import {PluginClient, usePlugin, createState, useValue, Layout} from 'flipper-plugin';
import { Tree, Input } from 'antd';
import {
  HomeOutlined,
  AndroidOutlined,
  WindowsOutlined,
  PartitionOutlined,
  MehOutlined,
} from '@ant-design/icons';

type Data = {
  key: string;
  title: string;
  children?: Array<Data>
  icon: Object
};

type Events = {
  newData: Data;
};

// Read more: https://fbflipper.com/docs/tutorial/js-custom#creating-a-first-plugin
// API: https://fbflipper.com/docs/extending/flipper-plugin#pluginclient
export function plugin(client: PluginClient<Events, {}>) {
    const data = createState<Record<string, Data>>({}, {persist: 'data'});

    client.onMessage('newData', (newData) => {
        data.update((draft) => {
            draft[newData.key] = newData;
        });
    });

    client.addMenuEntry({
        action: 'clear',
        handler: async () => {
            data.set({});
        },
    });
    console.log(data);

    const dataList = [];
    const generateList = data => {
        for (let i = 0; i < data.length; i++) {
            const node = data[i];
            const { key } = node;
            dataList.push({ key, title: key });
            if (node.children) {
                generateList(node.children);
            }
        }
    };
    generateList(data);

    console.log(dataList);

    return {data};
}

// Read more: https://fbflipper.com/docs/tutorial/js-custom#building-a-user-interface-for-the-plugin
// API: https://fbflipper.com/docs/extending/flipper-plugin#react-hooks
export function Component() {
    const instance = usePlugin(plugin);
    const data = useValue(instance.data);
    const { Search } = Input;

    console.log(data[0])
    if (Object.keys(data).length < 1) {
        return (
            <Layout.ScrollContainer>
            </Layout.ScrollContainer>
        );
    } else {
         return (
            <Layout.ScrollContainer>
                <Search style={{ marginBottom: 8 }} placeholder="Search" onChange={this.onChange} />
                <Tree
                    showIcon
                    defaultExpandAll
                    autoExpandParent
                    treeData={[data[0]]}
                />
            </Layout.ScrollContainer>
         );
    }
}
