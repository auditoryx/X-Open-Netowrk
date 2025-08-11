import dynamic from 'next/dynamic';
import { NextPage } from 'next';

// Dynamically import the demo to avoid SSR issues with framer-motion
const MultiStepFormDemo = dynamic(
  () => import('@/components/forms/MultiStepFormDemo'),
  { ssr: false }
);

const UIEnhancementDemo: NextPage = () => {
  return <MultiStepFormDemo />;
};

export default UIEnhancementDemo;