import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MarketingHeader } from './Header';
import { MarketingFooter } from './Footer';

export const MarketingLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <MarketingHeader />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-grow"
      >
        <Outlet />
      </motion.main>

      <MarketingFooter />
    </div>
  );
};


