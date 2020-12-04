import React from 'react';
import {PluginClient, usePlugin, createState, useValue, Layout} from 'flipper-plugin';
import { makeStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';

type Data = {
  id: string;
  scope: string;
  children?: Array<Data>
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
      draft[newData.id] = newData;
    });
  });

  client.addMenuEntry({
    action: 'clear',
    handler: async () => {
      data.set({});
    },
  });

  return {data};
}

const useStyles = makeStyles({
  root: {
    height: 240,
    flexGrow: 1,
    maxWidth: 400,
  },
});



// Read more: https://fbflipper.com/docs/tutorial/js-custom#building-a-user-interface-for-the-plugin
// API: https://fbflipper.com/docs/extending/flipper-plugin#react-hooks
export function Component() {
  const instance = usePlugin(plugin);
  const data = useValue(instance.data);
  const classes = useStyles();
  const renderTree = (nodes) => (
    <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.scope}>
      {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
    </TreeItem>
  );
     const renderDodoTree = (nodes) => (
       <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
         {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
       </TreeItem>
      );

  const dodo = {
    id: 'root',
    name: 'Parent',
    children: [
      {
        id: '1',
        name: 'Child - 1',
      },
      {
        id: '3',
        name: 'Child - 3',
        children: [
          {
            id: '4',
            name: 'Child - 4',
          },
        ],
      },
    ],
  };

 return (
    <Layout.ScrollContainer>
      {/*       DADA STRING */}
      {Object.entries(data).map(([id, d]) => (
        <pre key={id} data-testid={id}>
          {JSON.stringify(d)}
        </pre>
      ))}
      {/* it shows : {"children":[{"scope":"com.coursesu.app.presentation.basket.BasketViewModel@ca4ffc4","id":1},{"scope":"com.coursesu.app.presentation.store.StorePageViewModel@ed45430","id":2},{"scope":"com.coursesu.app.ui.onboarding.OnBoardingActivity@ab8e3c","id":3}],"scope":"class toothpick.Toothpick","id":0}       */}
        {/*         FAKE */}
      <TreeView
          className={classes.root}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpanded={['root']}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          {renderDodoTree(dodo)}
      </TreeView>
      <TreeView
            className={classes.root}
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpanded={['root']}
            defaultExpandIcon={<ChevronRightIcon />}
          >
                        ON AFFICHE ROOT ET SON SCOPE
            {Object.entries(data).map(([id, d]) => (
                <TreeItem key={d.id} nodeId={d.id} label={d.scope + ' - ' + d.id + ' - ' + id}/>
            ))}
                        ON AFFICHE LE CONENU DE CHILDREN
            {Object.entries(data).map(([id, d]) => (
                <TreeItem key={d.id} nodeId={d.id} label={JSON.stringify(d.children)}/>
            ))}
                        ESSAI AVEC MAP
            {Object.entries(data).map((child, i) => <TreeItem key={child.id} nodeId={child.id} label={child.scope}/>)}
      </TreeView>
            RECURSIF QUI MARCHE PAS
      <TreeView
            className={classes.root}
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpanded={['root']}
            defaultExpandIcon={<ChevronRightIcon />}
          >
            {renderTree(data)}
      </TreeView>
    </Layout.ScrollContainer>
  );
}
