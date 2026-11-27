/** Родительская категория с подкатегориями для публичного каталога. */
export class CategoryResponseDto {
  id!: number;
  name!: string;
  children!: { id: number; name: string }[];
}
