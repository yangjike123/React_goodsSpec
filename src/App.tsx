import { PlusOutlined, CloseCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { Table, Popover, Button, Input, InputRef, message, Tag, InputNumber } from 'antd';
import { useRef, useState } from 'react';
import { useEffect } from 'react';
import { TableData } from './interface';
// eslint-disable-next-line react-refresh/only-export-components
export default () => {
  // ---------变量------------
  const inputRef = useRef<InputRef>(null);
  const inputRefValue = useRef<InputRef>(null)
  const [tableData, setTableData] = useState<TableData[]>([]); // 显示的数据数量
  const [focusInput, setFocusInput] = useState<boolean>(false);
  const [inputVisible, setInputVisible] = useState<boolean>(false);
  const [inputValueIndex, setInputValueIndex] = useState<number>(0);
  const [inputSpecName, setInputSpecName] = useState<string>('');//规格名
  const [specValue, setSpecValue] = useState<string>(''); //规格值
  const [specList, setSpecList] = useState<{ label: string, tags: Array<string> }[]>([]); // 规格展示数据
  const [submitList, setSubmitList] = useState<TableData[]>([])
  const skuValues = useRef<any>({}); // 规格sku
  // ---------方法函数------------
  function onPressEnter() {
    if (inputSpecName) {
      specList.push({ label: inputSpecName, tags: [] });
      setInputSpecName('');
    } else {
      message.error('请输入规格名称');
    }
  }
  //添加规格值
  function onAddSpecValue(label: string) {
    if (specValue) { // 规格值
      specList.find(t => t.label === label)?.tags.push(specValue);
      // 如果有一样的规格名称就push到老的规格值里面
      if (skuValues.current[label]) skuValues.current[label].push(specValue);
      else skuValues.current = ({ ...skuValues.current, [label]: [specValue] });
      tableSKU();
      setSpecValue('');
      setInputVisible(false);
    } else {
      setInputVisible(false);
    }
  }
  function onDeleteSpecValue(index: number, tagsIndex: number, label: string) { // 删除规格值
    specList[index].tags.splice(tagsIndex, 1);
    skuValues.current[label].splice(tagsIndex, 1);//找到相对于的那个sku并删除里面值
    tableSKU();//重新绘制页面和数据
  }
  function onDeleteSpec(label: string) { // 删除规格
    delete skuValues.current[label];
    const filterValue = specList.filter(t => t.label !== label);
    setSpecList(filterValue);
    tableSKU();//重新绘制页面和数据
  }
  function tableSKU() {
    let temp: any[] = [];
    if (JSON.stringify(skuValues.current) === '{}') setTableData([]);
    for (const key in skuValues.current) {
      const items: Array<string> = skuValues.current[key];
      if (!temp.length) temp.push(...items.map(t => ({ [key]: t })));
      else {
        const i2: any[] = [];
        temp.forEach(obj => {
          if (items.length === 0) i2.push(obj);
          else i2.push(...items.map(t => ({ ...obj, [key]: t })));
        })
        temp = i2;
      }
      setTableData(temp);
      const headers = Object.keys(skuValues.current),
        skuItems = [];
      for (let index = 0; index < temp.length; index++) {
        const el = temp[index];
        let count = 0, obj: TableData = { piece: 0, stock: 0 };
        for (let i = 0; i < headers.length; i++) {
          const hader = headers[i];
          if (hader) {
            count++;
            const oldValue = submitList[index];//防止输入的数据丢失
            if (oldValue) {
              obj = {
                ...obj,
                [`skuName${count}`]: hader,
                [`skuValue${count}`]: el[hader],
                piece: oldValue.piece || 0,
                stock: oldValue.stock || 0,
                id: oldValue.id,
              };
            } else {
              obj = {
                ...obj,
                [`skuName${count}`]: hader,
                [`skuValue${count}`]: el[hader],
                id: Number(Date.now) + index + i,
              };
            }

          }
        }
        skuItems.push(obj);
      }
      setSubmitList(skuItems);
    }
    return temp;
  }
  // ---------生命周期------------
  useEffect(() => {
    inputRef.current?.focus();
    return () => {
      setFocusInput(false);
    };
  }, [focusInput]);
  useEffect(() => {
    inputRefValue.current?.focus()
  }, [inputVisible])
  // ----------HTML-----------
  const content = (
    <Input
      style={{ width: 300 }}
      onPressEnter={onPressEnter}
      onChange={(e) => setInputSpecName(e.target.value)}
      ref={inputRef}
      placeholder='请输入规格名称，请按下enter键确认'
      value={inputSpecName}
    />
  )
  return <div style={{ width: '80%', margin: 'auto' }}>
    <div style={{ textAlign: 'center' }}>
      <Popover content={content} trigger="click">
        <Button onClick={() => { setFocusInput(true) }}>添加规格</Button>
      </Popover>
    </div>
    <div>
      {specList.map(({ label, tags }, index) => {
        return <div key={index}>
          <div>
            <h3>{label}<CloseOutlined onClick={() => onDeleteSpec(label)} /></h3>
          </div>
          <div style={{ display: 'flex' }}>
            {tags.map((t, tagsIndex) => (<Tag icon={<CloseCircleOutlined onClick={() => onDeleteSpecValue(index, tagsIndex, label)} />} key={tagsIndex}>{t}</Tag>))}
            <div>
              {inputVisible && inputValueIndex === index ? (
                <Input
                  ref={inputRefValue}
                  value={specValue}
                  onChange={(e) => setSpecValue(e.target.value)}
                  onPressEnter={() => onAddSpecValue(label)}
                  onBlur={() => onAddSpecValue(label)}
                  placeholder='请输入规格值'
                  size="small"
                />
              ) : (
                <Tag style={{ cursor: 'pointer' }} onClick={() => {
                  setInputVisible(true);
                  setInputValueIndex(index);
                }}>
                  <PlusOutlined /> 新增规格值
                </Tag>
              )}
            </div>
          </div>
        </div>
      })}
    </div>
    <Table rowKey={'id'} columns={[
      ...specList.map((t, i) => {
        return {
          title: t.label,
          render: (record: any) => {
            return record[t.label]
          }
        }
      }),
      {
        title: '价格',
        dataIndex: 'piece',
        key: 'piece',
        render: (value, record, index) => {
          return <InputNumber onChange={(e) => {
            submitList[index].piece = e;
            setSubmitList(submitList)
            console.log('submitList: ', submitList);
          }} defaultValue={0} precision={2} style={{ width: '100%' }} />
        }
      },
      {
        title: '库存',
        dataIndex: 'stock',
        key: 'stock',
        render: (value, record, index) => {
          return <InputNumber onChange={(e) => {
            submitList[index].stock = e;
            setSubmitList(submitList)
            console.log('submitList: ', submitList);
          }} defaultValue={0} precision={0} style={{ width: '100%' }} />
        }
      }]
    } dataSource={tableData} />
  </div>
}