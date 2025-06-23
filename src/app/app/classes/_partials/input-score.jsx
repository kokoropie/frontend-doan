'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppContext } from "@/contexts/app-context";
import { httpDelete, httpPatch, httpPost } from "@/lib/http";
import { Check, Edit, Trash, X } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";

export default ({ student, _class, type, score = null }) => {
  const appContext = useContext(AppContext);
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState(score?.score ?? '');
  const [sScore, setScore] = useState(score?.score ?? '-');
  const inputRef = useRef(null);

  const handleChange = () => {
    if (!value || isNaN(value)) {
      toast.error('Điểm không hợp lệ');
      return;
    }

    if (score?.id) {
      httpPatch(appContext.getRoute('classes.scores.update', [_class.id, score.id]), {
        score: value
      }).then(() => {
        setEdit(false);
        setScore(value);
      })
    } else {
      httpPost(appContext.getRoute('classes.scores.store', [_class.id]), {
        student_id: student.id,
        score: value,
        type: type,
        class_subject_semester_id: score.linked_id
      }).then(() => {
        setEdit(false);
        setScore(value);
      })
    }
  }

  const removeScore = () => {
    if (!score?.id) return;

    httpDelete(appContext.getRoute('classes.scores.remove', [_class.id, score.id]))
      .then(() => {
        setEdit(false);
        setScore('-');
      })
      .catch(err => {
        console.error(err);
        toast.error('Xóa điểm không thành công');
      });
  }

  useEffect(() => {
    if (edit && inputRef.current) {
      inputRef.current.focus();
    }
  }, [edit, inputRef])

  if (edit) {
    return <div className="w-30 flex items-center">
      <Input 
        type="number" 
        min={0} 
        max={10} 
        step={0.01} 
        value={value} 
        onChange={(e) => setValue(e.target.value)} 
        className="h-5 px-1"
        ref={inputRef}
        />
      <Button
        variant="ghost" 
        size="icon" 
        className="ml-2 p-0 h-6 w-6" 
        onClick={handleChange}
      >
        <Check className="h-4 w-4 text-green-500" />
      </Button>
      <Button
        variant="ghost" 
        size="icon" 
        className="ml-2 p-0 h-6 w-6" 
        onClick={removeScore}
      >
        <Trash className="h-4 w-4 text-red-500" />
      </Button>
      <Button
        variant="ghost" 
        size="icon" 
        className="ml-2 p-0 h-6 w-6" 
        onClick={() => setEdit(false)}
      >
        <X className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  }

  return <div className="w-30 flex items-center justify-between">
    <span className="pl-1">{sScore}</span>
    {score.show_actions && (
      <Button
        variant="ghost" 
        size="icon" 
        className="ml-2 p-0 h-6 w-6" 
        onClick={() => setEdit(true)}
      >
        <Edit className="h-4 w-4" />
      </Button>
    )}
  </div>
}