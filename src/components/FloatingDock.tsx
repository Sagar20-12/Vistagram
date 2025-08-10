import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import LoginModal from "./LoginModal";
import SearchDialog from "./SearchDialog";
import MessagesDialog from "./MessagesDialog";
import NotificationsDialog from "./NotificationsDialog";

export default function FloatingDock() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const items = [
    { title: "Home", icon: "🏠", href: "/", action: () => {} },
    { title: "Search", icon: "🔍", href: "#", action: () => setSearchOpen(true) },
    { title: "Messages", icon: "💬", href: "#", action: () => setMessagesOpen(true) },
    { title: "Notifications", icon: "🔔", href: "#", action: () => setNotificationsOpen(true) },
    { title: "Profile", icon: "👤", href: "/profile", action: () => {} },
  ];

  return (
    <>
      <FloatingDockDesktop items={items} />
      <FloatingDockMobile items={items} />
      <div className="fixed top-4 right-4 z-50">
        <LoginModal />
      </div>
      
      {/* Dialogs */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <MessagesDialog open={messagesOpen} onOpenChange={setMessagesOpen} />
      <NotificationsDialog open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </>
  );
}

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: { title: string; icon: string; href: string; action: () => void }[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  
  const handleItemClick = (item: { title: string; icon: string; href: string; action: () => void }) => {
    if (item.href === "#") {
      item.action();
    }
    setOpen(false);
  };

  return (
    <div className={cn("fixed top-4 right-4 block md:hidden z-50", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute bottom-full right-0 mb-2 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                {item.href === "#" ? (
                  <button
                    onClick={() => handleItemClick(item)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-gray-200/50"
                  >
                    <div className="text-lg">{item.icon}</div>
                  </button>
                ) : (
                  <Link
                    to={item.href}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-gray-200/50"
                  >
                    <div className="text-lg">{item.icon}</div>
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-gray-200/50"
      >
        <span className="text-lg">☰</span>
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: { title: string; icon: string; href: string; action: () => void }[];
  className?: string;
}) => {
  let mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "fixed top-4 left-1/2 transform -translate-x-1/2 hidden md:flex h-20 items-end gap-8 rounded-2xl bg-white/80 backdrop-blur-md px-6 pb-3 shadow-lg border border-gray-200/50 z-50",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  action,
}: {
  mouseX: MotionValue;
  title: string;
  icon: string;
  href: string;
  action: () => void;
}) {
  let ref = useRef<HTMLDivElement>(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  let heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20],
  );

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (href === "#") {
      action();
    }
  };

  const Container = href === "#" ? "button" : Link;
  const containerProps = href === "#" ? { onClick: handleClick } : { to: href };

  return (
    <Container {...containerProps}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex flex-col items-center justify-center rounded-full bg-gray-100/80 hover:bg-gray-200/80 transition-colors"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-8 left-1/2 w-fit rounded-md border border-gray-200 bg-white/90 backdrop-blur-sm px-2 py-0.5 text-xs whitespace-pre text-gray-700 shadow-sm"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center mb-1"
        >
          <span className="text-lg">{icon}</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xs font-medium text-gray-600 whitespace-nowrap"
        >
          {title}
        </motion.div>
      </motion.div>
    </Container>
  );
}
