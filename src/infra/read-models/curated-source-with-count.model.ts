export type CuratedSourceWithCount = {
  id: number;
  name: string;
  url: string;
  isActiveYn: 'Y' | 'N';
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
};