'use client';

import Table from "@/components/table";
import Block from "@/components/ui/block";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { AppContext } from "@/contexts/app-context";
import { httpGet } from "@/lib/http";
import { useContext, useEffect, useState } from "react";
import FeedbackModal from "./feedback-modal";

export default ({ open = false, status = '', columns = [], title = '', description = '' }) => {
  const appContext = useContext(AppContext);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  const pushData = (newData, clear = false) => {
    let cD = clear ? [] : [...data];
    const cloneData = [...cD, ...newData];
    setData(cloneData.filter((item, index) => cloneData.indexOf(item) === index));
  };

  const loadData = (page = 1, clear = false) => {
    if (loading) return;
    setLoading(true);
    httpGet(appContext.getRoute('feedback.index'), {
      params: {
        page: page,
        per_page: 500,
        status: status
      }
    })
      .then((res) => {
        if (res.status === 200) {
          const { data, meta } = res.data.data;
          pushData(data, clear);
          setMeta(meta);
        } else {
          toast.error(res.data.message);
        }
      }).finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    if (open) {
      setLoading(false);
      setData([]);
      setMeta(null);
    }
  }, [open])

  useEffect(() => {
    if (!loading) {
      if (!meta || meta.current_page < meta.last_page) {
        loadData(meta ? meta.current_page + 1 : 1);
      }
    }
  }, [meta])

  return <Card>
    <CardContent>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
      <Block isBlocking={loading}>
        <Table data={data} columns={columns} />
      </Block>
    </CardContent>
  </Card>
}