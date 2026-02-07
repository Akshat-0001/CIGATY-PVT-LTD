import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { toTitleCase } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, Package } from "lucide-react";
import { motion } from "framer-motion";
import { hoverLift, springTransition, fadeInUp } from "@/lib/animations";

interface Props {
  row: any;
  priceLabel: (row: any) => string;
  descr: (row: any) => string;
}

export default function MarketplaceCard({ row, priceLabel, descr }: Props) {
  const img = Array.isArray(row.image_urls) && row.image_urls.length > 0 ? row.image_urls[0] : null;
  const dutyPaid = row.duty !== "under_bond";
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const isNew = (createdAt?: string | null) => !!createdAt && (Date.now() - new Date(createdAt).getTime() < THIRTY_DAYS_MS);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeInUp}
      whileHover={hoverLift}
      transition={springTransition}
      className="group relative rounded-2xl border bg-card overflow-hidden glass-card transition-all duration-300"
    >
      {/* Half-outside NEW badge at top-left if <30 days */}
      {isNew(row.created_at) && (
        <div className="pointer-events-none absolute -top-2 -left-2 z-20">
          <span className="inline-flex items-center h-5 px-2 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold shadow-md">New</span>
        </div>
      )}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "radial-gradient(1200px 200px at top, rgba(59,130,246,0.12), transparent 50%)" }}
      />
      <Link to={`/product/${row.id}`} className="block">
        <div className="aspect-[3/2] bg-muted overflow-hidden">
          {img ? (
            <img
              src={img}
              alt={row.product_name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">IMG</div>
          )}
        </div>
      </Link>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold truncate leading-tight text-black">{row.product_name}</h3>
          <Badge variant="secondary" className="shrink-0">{toTitleCase(row.category)}</Badge>
        </div>

        <div className="text-sm text-muted-foreground truncate" title={descr(row)}>
          {descr(row) || "—"}
        </div>

        <div className="flex items-baseline gap-2">
          <div className="text-lg font-semibold">{priceLabel(row)}</div>
          <div className="text-xs text-muted-foreground">per case</div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className={dutyPaid ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"}>
            {dutyPaid ? "Duty Paid" : "Under Bond"}
          </Badge>
          <Badge variant="outline">QTY {row.quantity}</Badge>
          {row.bottles_per_case ? (
            <Badge variant="outline">{row.bottles_per_case} btls/case</Badge>
          ) : null}
        </div>

        <motion.div 
          className="flex items-center gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild size="sm" variant="outline" className="flex-1">
              <Link to={`/product/${row.id}`} aria-label={`View ${row.product_name}`}>
                <Eye className="h-4 w-4 mr-1.5" /> View
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild size="sm" className="flex-1">
              <Link to={`/product/${row.id}#reserve`} aria-label={`Reserve ${row.product_name}`}>
                <Package className="h-4 w-4 mr-1.5" /> Reserve
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}>
            <Button size="icon" variant="secondary" aria-label="Add to cart" title="Add to cart">
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}


