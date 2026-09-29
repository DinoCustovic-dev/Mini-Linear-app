import Skeleton from '@/components/Skeleton';

export default function Loading() {
  return (
    <main className='layout flex min-h-screen flex-col justify-center gap-4'>
      <Skeleton className='h-8 w-1/3' />
      <Skeleton className='h-4 w-2/3' />
      <Skeleton className='h-4 w-1/2' />
    </main>
  );
}
