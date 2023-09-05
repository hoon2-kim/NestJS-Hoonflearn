export interface ICategoryNameResponse {
  name: string;
}

export interface ICategoryResponse {
  id: string;
  name: string;
  sub_category: ISubCategoryResponse[];
}

export interface ISubCategoryResponse {
  id: string;
  fk_parent_category_id: string;
  name: string;
}
