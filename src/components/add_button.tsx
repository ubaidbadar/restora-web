import type { ElementType } from 'react';
import { Plus } from 'lucide-react';
import Button, { type ButtonProps } from '../ui/button';
import { Link, LinkProps } from 'react-router';


export default function AddButton<T extends ElementType = 'button'>(props: ButtonProps<T>) {
    return (
        <Button
            icon={Plus}
            {...props}
            className={`[&>svg]:-ml-1 [&>svg]:-mr-0.5 ${props.className ?? ''}`}
        />
    );
}

export const AddLink = (props: LinkProps) => (
    <AddButton {...props} as={Link} />
)