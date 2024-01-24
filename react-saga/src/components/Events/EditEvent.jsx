import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchEvent, updateEvent } from "../../utils/http.js";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../../utils/http.js";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();

  const { data, isPending, error, isError } = useQuery({
    queryKey: ["events", { id: params.id }],
    queryFn: ({ signal, queryKey }) => fetchEvent({ ...queryKey[1], signal }),
  });

  const {mutate} = useMutation({
    queryKey: ["events", { id: params.id }],
    mutationFn: updateEvent,
    onMutate: async (data) => {
      const newEvent = data.event;
      await queryClient.cancelQueries({queryKey: ["events", { id: params.id }]});
      const previousEvent = queryClient.getQueryData(["events", { id: params.id }]);
      queryClient.setQueryData(["events", { id: params.id }], newEvent);
      return {previousEvent};
    },
    onError: (error, data, context) => {
      queryClient.setQueryData(["events", { id: params.id }], content.previousEvent);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["events", { id: params.id }]);
    }
  })

  function handleSubmit(formData) {
    mutate({id: params.id, event: formData});
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isPending) {
    content = <div className="center">
      <LoadingIndicator/>
    </div>
  }

  if(isError) {
    content = <>
    <ErrorBlock title="Failed to load event" message={error.info?.message || "Try to do it later"}/>
    <div className="form-actions">
      <Link to={'../'} className="button">Okey</Link>
    </div>
    </>
  }

  if(data) {
    content = <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
  }

  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}
