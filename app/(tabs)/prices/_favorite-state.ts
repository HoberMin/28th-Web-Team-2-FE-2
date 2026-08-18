export interface FavoriteState {
  liked: boolean;
  previousLiked: boolean;
  pending: boolean;
  message: string | null;
}

export type FavoriteStateEvent =
  | { type: "hydrate"; liked: boolean }
  | { type: "request"; liked: boolean }
  | { type: "success" }
  | { type: "failure"; message: string }
  | { type: "notice"; message: string };

export function createFavoriteState(liked: boolean): FavoriteState {
  return { liked, previousLiked: liked, pending: false, message: null };
}

export function reduceFavoriteState(
  state: FavoriteState,
  event: FavoriteStateEvent,
): FavoriteState {
  switch (event.type) {
    case "hydrate":
      if (state.pending || state.liked === event.liked) return state;
      return createFavoriteState(event.liked);
    case "request":
      if (state.pending) return state;
      return {
        liked: event.liked,
        previousLiked: state.liked,
        pending: true,
        message: null,
      };
    case "success":
      return {
        liked: state.liked,
        previousLiked: state.liked,
        pending: false,
        message: null,
      };
    case "failure":
      return {
        liked: state.previousLiked,
        previousLiked: state.previousLiked,
        pending: false,
        message: event.message,
      };
    case "notice":
      return { ...state, message: event.message };
  }
}
