import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My issues',
};

export default function MyIssuesPage() {
  return (
    <section>
      <h1 className='h3'>My issues</h1>
      <p className='mt-2 text-gray-500'>
        Issues assigned to you will show up here.
      </p>
    </section>
  );
}
