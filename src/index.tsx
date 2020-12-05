import React from 'react';
import {PluginClient, usePlugin, createState, useValue, Layout} from 'flipper-plugin';
import { Tree, Typography } from 'antd';
import {
  HomeOutlined,
  AndroidOutlined,
  WindowsOutlined,
  PartitionOutlined,
  MehOutlined,
} from '@ant-design/icons';
import {ManagedDataInspector, DetailSidebar} from 'flipper';

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
    const selectedID = createState<string | null>(null, {persist: 'selection'});

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

      function setSelection(id: number) {
        selectedID.set('' + id);
        console.log("selected", id)
      }

    console.log("selected", selectedID)
    console.log("data", data)
    return {
        data,
        selectedID,
        setSelection,
    };
}

// Read more: https://fbflipper.com/docs/tutorial/js-custom#building-a-user-interface-for-the-plugin
// API: https://fbflipper.com/docs/extending/flipper-plugin#react-hooks
export function Component() {
    const instance = usePlugin(plugin);
    const data = useValue(instance.data);
    const selectedID = useValue(instance.selectedID);

    const onSelect = (selectedKeys, info) => {
        console.log('selected', selectedKeys);//, info);
        instance.setSelection(selectedKeys[0])
    };

    if (Object.keys(data).length < 1) {
        return (
            <Layout.ScrollContainer>
            </Layout.ScrollContainer>
        );
    } else {
         return (
         <>
            <Layout.ScrollContainer>
                <Tree
                    // showIcon
                    defaultExpandAll
                    autoExpandParent
                    onSelect={onSelect}
                    treeData={[data[0]]}
                />
            </Layout.ScrollContainer>
              <DetailSidebar>
                {selectedID && renderSidebar(data[0],selectedID)}
              </DetailSidebar>
              </>
         );
    }

    function renderSidebar(row: Row, selectedId :number) {
        console.log("row: ", row)
        console.log("id: ", selectedId)
        console.log("row: ", filter(row,selectedId))
      return (
        <Layout.Container gap pad>
          <Typography.Title level={4}>Extras</Typography.Title>
          <ManagedDataInspector data={row} expandRoot={true} />
        </Layout.Container>
      );
      }

    function filter(array, text) {
        const getNodes = (result, object) => {
            if (object.key === text) {
                result.push(object);
                return result;
            }
            if (Array.isArray(object.children)) {
                const nodes = object.children.reduce(getNodes, []);
                if (nodes.length) result.push({ ...object, nodes });
            }
            return result;
        };

        return array.children.reduce(getNodes, []);
    }
}
